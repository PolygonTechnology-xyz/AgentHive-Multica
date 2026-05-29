import { UnauthorizedException } from '@nestjs/common';
import { PpayIpnController } from './ppay-ipn.controller';
import { PaymentsService } from './payments.service';

describe('PpayIpnController', () => {
  let controller: PpayIpnController;
  let payments: { handleIpn: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(() => {
    payments = { handleIpn: jest.fn().mockResolvedValue({ ok: true, processed: true }) };
    config = { get: jest.fn().mockReturnValue('SECRET') };
    controller = new PpayIpnController(payments as unknown as PaymentsService, config as any);
  });

  const validBody = {
    paymentId: 'PID',
    uniqueIdForMerchant: 'order_1',
    status: 'SUCCESSFUL' as const,
    transactionId: 'TXN1',
  };

  it('returns { ok: true } on valid signature + payload', async () => {
    const result = await controller.receive('SECRET', validBody);
    expect(result).toEqual({ ok: true });
    expect(payments.handleIpn).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: 'PID', status: 'SUCCESSFUL' }),
    );
  });

  it('throws UnauthorizedException when x-api-key missing', async () => {
    await expect(controller.receive(undefined, validBody)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(payments.handleIpn).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when x-api-key wrong', async () => {
    await expect(controller.receive('WRONG', validBody)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(payments.handleIpn).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when no apiSecret configured', async () => {
    config.get.mockReturnValueOnce('');
    await expect(controller.receive('SECRET', validBody)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('forwards failReason to service', async () => {
    await controller.receive('SECRET', {
      paymentId: 'PID',
      uniqueIdForMerchant: 'order_1',
      status: 'FAILED',
      failReason: 'insufficient balance',
    });
    expect(payments.handleIpn).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FAILED', failReason: 'insufficient balance' }),
    );
  });
});
