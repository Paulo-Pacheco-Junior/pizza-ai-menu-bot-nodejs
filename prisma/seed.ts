import { PrismaClient, MenuType } from "@prisma/client";

const prisma = new PrismaClient();

interface MenuItemSeed {
  name: string;
  type: MenuType;
  description: string;
  price: number;
}

const menuItems: MenuItemSeed[] = [
  {
    name: "Margherita",
    type: MenuType.pizza,
    description: "Molho de tomate, mussarela e manjericão.",
    price: 39.9,
  },
  {
    name: "Calabresa",
    type: MenuType.pizza,
    description: "Calabresa, cebola e azeitonas.",
    price: 42.9,
  },
  {
    name: "Portuguesa",
    type: MenuType.pizza,
    description: "Presunto, ovos, cebola e ervilha.",
    price: 44.9,
  },
  {
    name: "Quatro Queijos",
    type: MenuType.pizza,
    description: "Mussarela, parmesão, gorgonzola e provolone.",
    price: 49.9,
  },
  {
    name: "Coca-Cola",
    type: MenuType.bebida,
    description: "Refrigerante gelado.",
    price: 7.0,
  },
  {
    name: "Suco de Laranja",
    type: MenuType.bebida,
    description: "Suco natural de laranja.",
    price: 12.0,
  },
  {
    name: "Brownie",
    type: MenuType.sobremesa,
    description: "Brownie com calda de chocolate.",
    price: 12.0,
  },
  {
    name: "Pudim",
    type: MenuType.sobremesa,
    description: "Pudim tradicional.",
    price: 10.0,
  },
];

async function seedMenu(items: MenuItemSeed[]): Promise<void> {
  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {
        type: item.type,
        description: item.description,
        price: item.price,
      },
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
