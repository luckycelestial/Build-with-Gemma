/**
 * ============================================================================
 * MODULE PURPOSE: Sales Domain Customer Database Repository
 * RESPONSIBILITIES:
 *  - Encapsulates Prisma SQL database queries for `Customer` table.
 *  - Stores and manages Customer Master records (Name, Company, Phone, WhatsApp JID, Interested Product).
 *  - Resolves customers by WhatsApp JID or contact phone number.
 * OWNS: Direct Prisma DB queries & in-memory metrics for registered customers.
 * SHOULD NOT OWN: Sales mission state transitions or margin calculation logic.
 * ============================================================================
 */

export interface CustomerMasterItem {
  id: number;
  name: string;
  company: string;
  contactChannel: string; // phone number e.g. "+919880011223"
  whatsappJid: string; // Manual WhatsApp JID e.g. "202516935528474"
  interestedProduct: string; // e.g. "CNC Mounting Bracket"
  status: 'Active' | 'Inactive';
  lastConversation?: string;
  createdAt?: string;
  updatedAt?: string;
}

const seedCustomers = [
  { name: 'Apex Engineering (Ramesh)', company: 'Apex Engg Pvt Ltd', phone: '+919880011223', jid: '202516935528474', product: 'CNC Mounting Bracket' },
  { name: 'Precision Tools (Sanjay)', company: 'Precision Tools India', phone: '+919363638758', jid: '204118762311452', product: 'CNC Mounting Bracket' }
];

export class CustomerRepository {
  /**
   * Returns all registered customers from PostgreSQL.
   * Auto-seeds initial customers if table is empty.
   */
  static async getAllCustomers(): Promise<CustomerMasterItem[]> {
    const { prisma } = await import('@/lib/prisma-client');
    let dbCustomers = await prisma.customer.findMany({ orderBy: { id: 'asc' } });

    if (dbCustomers.length === 0) {
      await this.ensureSeedCustomers();
      dbCustomers = await prisma.customer.findMany({ orderBy: { id: 'asc' } });
    }

    return dbCustomers.map(c => ({
      id: c.id,
      name: c.name,
      company: c.company || '',
      contactChannel: c.contactChannel,
      whatsappJid: c.whatsappJid || '',
      interestedProduct: c.interestedProduct || 'CNC Mounting Bracket',
      status: (c.status as 'Active' | 'Inactive') || 'Active',
      lastConversation: c.lastConversation || '',
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    }));
  }

  /**
   * Seed initial customers if table is empty
   */
  private static async ensureSeedCustomers() {
    const { prisma } = await import('@/lib/prisma-client');
    for (const seed of seedCustomers) {
      try {
        const existing = await prisma.customer.findUnique({ where: { contactChannel: seed.phone } });
        if (!existing) {
          await prisma.customer.create({
            data: {
              name: seed.name,
              company: seed.company,
              contactChannel: seed.phone,
              whatsappJid: seed.jid,
              interestedProduct: seed.product,
              status: 'Active'
            }
          });
        }
      } catch (e) {
        console.warn(`[CustomerRepository] Seed customer creation note for ${seed.name}:`, e);
      }
    }
  }

  /**
   * Creates a new customer in PostgreSQL with optional WhatsApp JID.
   */
  static async createCustomer(
    name: string,
    phone: string,
    company: string = '',
    interestedProduct: string = 'CNC Mounting Bracket',
    whatsappJid: string = ''
  ): Promise<CustomerMasterItem> {
    const { prisma } = await import('@/lib/prisma-client');
    const cleanPhone = phone.trim();
    const created = await prisma.customer.upsert({
      where: { contactChannel: cleanPhone },
      create: {
        name,
        company,
        contactChannel: cleanPhone,
        whatsappJid: whatsappJid.trim(),
        interestedProduct: interestedProduct.trim() || 'CNC Mounting Bracket',
        status: 'Active'
      },
      update: {
        name,
        company,
        whatsappJid: whatsappJid.trim(),
        interestedProduct: interestedProduct.trim() || 'CNC Mounting Bracket',
        status: 'Active'
      }
    });

    return {
      id: created.id,
      name: created.name,
      company: created.company || '',
      contactChannel: created.contactChannel,
      whatsappJid: created.whatsappJid || '',
      interestedProduct: created.interestedProduct,
      status: created.status as 'Active' | 'Inactive',
      lastConversation: created.lastConversation || '',
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  /**
   * Updates WhatsApp JID for a customer.
   */
  static async updateCustomerJid(id: number, whatsappJid: string) {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.customer.update({
      where: { id },
      data: { whatsappJid: whatsappJid.trim() }
    });
  }

  /**
   * Deletes a customer.
   */
  static async deleteCustomer(id: number) {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.customer.delete({ where: { id } });
  }

  /**
   * Finds a matching customer strictly by WhatsApp JID or phone number.
   */
  static async findByJidOrPhone(jidOrPhone: string): Promise<CustomerMasterItem | null> {
    const all = await this.getAllCustomers();
    const cleanTarget = jidOrPhone.replace(/\D/g, '');
    if (!cleanTarget) return null;

    // 1. Check whatsappJid match
    let matched = all.find(c => {
      if (!c.whatsappJid || c.whatsappJid.toLowerCase().includes('e.g.')) return false;
      const cleanJid = c.whatsappJid.replace(/\D/g, '');
      if (!cleanJid) return false;
      return (
        cleanTarget === cleanJid ||
        cleanTarget.includes(cleanJid) ||
        cleanJid.includes(cleanTarget) ||
        (cleanJid.length >= 8 && cleanTarget.length >= 8 && cleanTarget.slice(-8) === cleanJid.slice(-8))
      );
    });

    // 2. Fallback check contactChannel phone
    if (!matched) {
      matched = all.find(c => {
        if (!c.contactChannel) return false;
        const cleanPhone = c.contactChannel.replace(/\D/g, '');
        if (!cleanPhone) return false;
        return (
          cleanTarget === cleanPhone ||
          cleanTarget.includes(cleanPhone) ||
          cleanPhone.includes(cleanTarget) ||
          (cleanPhone.length >= 8 && cleanTarget.length >= 8 && cleanTarget.slice(-8) === cleanPhone.slice(-8))
        );
      });
    }

    return matched || null;
  }
}
