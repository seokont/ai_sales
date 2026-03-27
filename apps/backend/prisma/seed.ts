import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DEMO_API_KEY = 'sk_demo_main_page_000000000000000000000000';

async function main() {
  const prisma = new PrismaClient();
  try {

  const existing = await prisma.company.findUnique({
    where: { apiKey: DEMO_API_KEY },
  });
  if (existing) {
    await prisma.company.update({
      where: { apiKey: DEMO_API_KEY },
      data: { websiteUrl: 'https://ai-seller-widget.com' },
    });
    console.log('Demo company updated with websiteUrl');
    return;
  }

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ai-seller-widget.com' },
    update: {},
    create: {
      email: 'demo@ai-seller-widget.com',
      password: await bcrypt.hash('demo-widget-2024', 10),
      name: 'Demo Widget',
      role: 'user',
    },
  });

  const demoCompany = await prisma.company.create({
    data: {
      name: 'AI Seller Demo (головна)',
      apiKey: DEMO_API_KEY,
      systemPrompt:
        'You are an AI sales assistant for AI Seller Widget. Help visitors learn about the product. Answer questions about features, pricing, integration. Be friendly and concise.',
      plan: 'pro',
      widgetGreeting: 'Чим можу допомогти?',
      websiteUrl: 'https://ai-seller-widget.com',
    },
  });

  await prisma.userCompany.create({
    data: {
      userId: demoUser.id,
      companyId: demoCompany.id,
      role: 'owner',
    },
  });

  console.log('Demo company created. API key for main page:', DEMO_API_KEY);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
