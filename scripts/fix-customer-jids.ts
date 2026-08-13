import { prisma } from '../src/lib/prisma-client';

async function fixCustomerJids() {
  console.log('====================================================');
  console.log('🔧 FIXING CUSTOMER WHATSAPP JID MAPPINGS IN DATABASE');
  console.log('====================================================');

  const allCustomers = await prisma.customer.findMany();
  for (const c of allCustomers) {
    console.log(`• Customer #${c.id} Name: ${c.name} | Phone: ${c.contactChannel} | Current JID: ${c.whatsappJid}`);
    if (c.name.toLowerCase().includes('salmon') || c.whatsappJid?.includes('2025169935528474')) {
      const fixed = await prisma.customer.update({
        where: { id: c.id },
        data: { whatsappJid: '202516935528474' }
      });
      console.log(`✅ Fixed Customer #${c.id} (${c.name}) WhatsApp JID: '${fixed.whatsappJid}'`);
    }
  }

  console.log('\n✨ Database Customer JID fix completed successfully.');
}

fixCustomerJids().catch(console.error);
