import { prisma } from '../src/lib/prisma-client';

async function fixSupplierJids() {
  console.log('====================================================');
  console.log('🔧 FIXING SUPPLIER WHATSAPP JID MAPPINGS IN DATABASE');
  console.log('====================================================');

  const allSuppliers = await prisma.supplier.findMany();
  for (const s of allSuppliers) {
    const nameLower = s.name.toLowerCase();
    if (nameLower.includes('srinidhi')) {
      await prisma.supplier.update({ where: { id: s.id }, data: { whatsappJid: '202516935528474' } });
      console.log(`✅ Set Srinidhi (ID #${s.id}) WhatsApp JID: '202516935528474'`);
    } else if (nameLower.includes('kirubhashini')) {
      await prisma.supplier.update({ where: { id: s.id }, data: { whatsappJid: '20251699150272141' } });
      console.log(`✅ Set Kirubhashini (ID #${s.id}) WhatsApp JID: '20251699150272141'`);
    } else if (nameLower.includes('saran')) {
      await prisma.supplier.update({ where: { id: s.id }, data: { whatsappJid: '' } });
      console.log(`✅ Cleared Saran (ID #${s.id}) WhatsApp JID`);
    } else if (nameLower.includes('varan')) {
      await prisma.supplier.update({ where: { id: s.id }, data: { whatsappJid: '204118762311453' } });
      console.log(`✅ Set Varan (ID #${s.id}) WhatsApp JID: '204118762311453'`);
    }
  }

  console.log('\n✨ Database Supplier JID fix completed successfully.');
}

fixSupplierJids().catch(console.error);
