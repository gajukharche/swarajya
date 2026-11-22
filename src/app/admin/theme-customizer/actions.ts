'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PageSectionItem } from '@/lib/theme/sections-registry';

export async function saveThemeSectionsAction(sections: PageSectionItem[]) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await prisma.$transaction(async (tx) => {
    // Delete existing sections
    await tx.pageSection.deleteMany({});

    // Reinsert configured sections
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await tx.pageSection.create({
        data: {
          sectionType: s.sectionType,
          position: i,
          isVisible: s.isVisible,
          settings: s.settings as object,
        },
      });
    }
  });

  try {
    revalidatePath('/');
    revalidateTag('store:sections', 'default');
  } catch {}

  return { success: true };
}
