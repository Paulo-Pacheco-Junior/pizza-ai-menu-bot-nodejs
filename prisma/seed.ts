import { PrismaClient, MenuType } from "@prisma/client";

const prisma = new PrismaClient();

interface MenuItemSeed {
  name: string;
  type: MenuType;
  description: string;
}

const menuItems: MenuItemSeed[] = [
  {
    name: "Margherita",
    type: MenuType.pizza,
    description: "Molho de tomate, mussarela e manjericão.",
  },
  {
    name: "Calabresa",
    type: MenuType.pizza,
    description: "Calabresa, cebola e azeitonas.",
  },
  {
    name: "Portuguesa",
    type: MenuType.pizza,
    description: "Presunto, ovos, cebola e ervilha.",
  },
  {
    name: "Quatro Queijos",
    type: MenuType.pizza,
    description: "Mussarela, parmesão, gorgonzola e provolone.",
  },
  {
    name: "Coca-Cola",
    type: MenuType.bebida,
    description: "Refrigerante gelado.",
  },
  {
    name: "Suco de Laranja",
    type: MenuType.bebida,
    description: "Suco natural de laranja.",
  },
  {
    name: "Brownie",
    type: MenuType.sobremesa,
    description: "Brownie com calda de chocolate.",
  },
  {
    name: "Pudim",
    type: MenuType.sobremesa,
    description: "Pudim tradicional.",
  },
];

async function seedMenu(items: MenuItemSeed[]): Promise<void> {
  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }
}

async function main() {
  console.log("Iniciando seed do cardápio...");
  await seedMenu(menuItems);
  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
