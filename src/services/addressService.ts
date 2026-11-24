import { prisma } from '../config/database';

export interface AddressInput {
  label?: string;
  recipient: string;
  phone: string;
  address: string;
  province: string;
  provinceId?: string;
  city: string;
  cityId?: string;
  subdistrict?: string;
  subdistrictId?: string;
  postalCode: string;
  isDefault?: boolean;
}

const addressSelect = {
  id: true,
  label: true,
  recipient: true,
  phone: true,
  address: true,
  province: true,
  provinceId: true,
  city: true,
  cityId: true,
  subdistrict: true,
  subdistrictId: true,
  postalCode: true,
  isDefault: true,
  createdAt: true,
};

export const addressService = {
  async list(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      select: addressSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async create(userId: string, data: AddressInput) {
    const shouldBeDefault = data.isDefault || (await prisma.address.count({ where: { userId } })) === 0;

    return prisma.$transaction(async tx => {
      if (shouldBeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.create({
        data: {
          userId,
          label: data.label?.trim() || 'Rumah',
          recipient: data.recipient.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          province: data.province.trim(),
          provinceId: data.provinceId,
          city: data.city.trim(),
          cityId: data.cityId,
          subdistrict: data.subdistrict,
          subdistrictId: data.subdistrictId,
          postalCode: data.postalCode.trim(),
          isDefault: shouldBeDefault,
        },
        select: addressSelect,
      });
    });
  },

  async update(userId: string, id: string, data: Partial<AddressInput>) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      const err: any = new Error('Alamat tidak ditemukan');
      err.statusCode = 404;
      err.code = 'ADDRESS_NOT_FOUND';
      throw err;
    }

    return prisma.$transaction(async tx => {
      if (data.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.update({
        where: { id },
        data: {
          label: data.label,
          recipient: data.recipient,
          phone: data.phone,
          address: data.address,
          province: data.province,
          provinceId: data.provinceId,
          city: data.city,
          cityId: data.cityId,
          subdistrict: data.subdistrict,
          subdistrictId: data.subdistrictId,
          postalCode: data.postalCode,
          isDefault: data.isDefault,
        },
        select: addressSelect,
      });
    });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      const err: any = new Error('Alamat tidak ditemukan');
      err.statusCode = 404;
      err.code = 'ADDRESS_NOT_FOUND';
      throw err;
    }

    await prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return true;
  },
};
