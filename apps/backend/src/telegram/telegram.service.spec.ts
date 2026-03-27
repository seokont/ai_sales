import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramService],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect email in message', () => {
    expect(service.hasContacts('Contact me at test@example.com')).toBe(true);
    expect(service.hasContacts('No contact here')).toBe(false);
  });

  it('should detect phone in message', () => {
    expect(service.hasContacts('Call me +380501234567')).toBe(true);
    expect(service.hasContacts('My number is 050-123-45-67')).toBe(true);
  });

  it('should extract contacts', () => {
    const msg = 'Email: john@test.com, phone: +380501234567';
    const contacts = service.extractContacts(msg);
    expect(contacts.emails).toContain('john@test.com');
    expect(contacts.phones.length).toBeGreaterThan(0);
  });
});
