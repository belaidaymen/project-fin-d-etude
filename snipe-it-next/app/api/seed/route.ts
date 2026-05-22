import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const userCount = await prisma.user.count();

    // If users already exist, just refresh requests with proper types
    if (userCount > 0) {
      await prisma.equipmentRequest.deleteMany();

      const [userLog, userLab1, userLab2, labInfo, labReseaux] = await Promise.all([
        prisma.user.findFirst({ where: { username: "logistique" } }),
        prisma.user.findFirst({ where: { username: "labo1" } }),
        prisma.user.findFirst({ where: { username: "labo2" } }),
        prisma.location.findFirst({ where: { name: "Laboratoire Informatique" } }),
        prisma.location.findFirst({ where: { name: "Laboratoire Réseaux" } }),
      ]);

      if (userLab1 && labInfo && userLog) {
        await prisma.equipmentRequest.createMany({
          data: [
            {
              title: "Achat de 5 ordinateurs portables HP ProBook",
              description: "Les ordinateurs actuels du Lab Informatique sont vétustes. Nous avons besoin de 5 nouveaux portables pour les TP de programmation du S2.",
              type: "ACHAT",
              quantity: 5,
              urgency: "HAUTE",
              status: "EN_ATTENTE",
              requesterId: userLab1.id,
              laboratoireId: labInfo.id,
            },
            {
              title: "Remplacement du générateur de signal en panne (EQ-012)",
              description: "Le générateur EQ-012 est en panne depuis 3 semaines. Les TP d'électronique sont bloqués. Remplacement urgent nécessaire.",
              type: "REMPLACEMENT",
              quantity: 1,
              urgency: "HAUTE",
              status: "EN_ATTENTE",
              requesterId: userLab1.id,
              laboratoireId: labInfo.id,
            },
            {
              title: "Réforme du tableau interactif Smart Board (EQ-020)",
              description: "Le tableau interactif EQ-020 est hors service depuis 2022, réparation impossible. Demande de mise en réforme et remplacement.",
              type: "REFORME",
              quantity: 1,
              urgency: "NORMALE",
              status: "EN_ATTENTE",
              requesterId: userLab1.id,
              laboratoireId: labInfo.id,
            },
            ...(userLab2 && labReseaux ? [
              {
                title: "Achat d'une imprimante laser pour le Laboratoire Réseaux",
                description: "Besoin d'une imprimante pour imprimer les rapports de TP.",
                type: "ACHAT",
                quantity: 1,
                urgency: "NORMALE",
                status: "APPROUVEE",
                requesterId: userLab2.id,
                laboratoireId: labReseaux.id,
                reviewerId: userLog.id,
                reviewNote: "Demande approuvée. Commande en cours, livraison prévue dans 2 semaines.",
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              },
              {
                title: "Remplacement des câbles HDMI défaillants",
                description: "Remplacement des câbles HDMI usagés dans les salles de TP réseaux.",
                type: "REMPLACEMENT",
                quantity: 10,
                urgency: "BASSE",
                status: "REJETEE",
                requesterId: userLab2.id,
                laboratoireId: labReseaux.id,
                reviewerId: userLog.id,
                reviewNote: "Demande rejetée. Des câbles identiques sont disponibles en stock au magasin central. Merci de contacter le magasinier.",
                reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              },
            ] : []),
          ],
        });
      }

      return NextResponse.json({ success: true, message: "Demandes rafraîchies avec les types corrects" });
    }

    // --- First-time full seed ---
    const [enService, enPanne, enMaintenance, reforme, enStock] = await Promise.all([
      prisma.statuslabel.create({ data: { name: "En service", color: "#00a65a" } }),
      prisma.statuslabel.create({ data: { name: "En panne", color: "#d9534f" } }),
      prisma.statuslabel.create({ data: { name: "En maintenance", color: "#f0ad4e" } }),
      prisma.statuslabel.create({ data: { name: "Réformé", color: "#777777" } }),
      prisma.statuslabel.create({ data: { name: "En stock", color: "#337ab7" } }),
    ]);

    const [labInfo, labReseaux, labElec, labMath, stockRoom] = await Promise.all([
      prisma.location.create({ data: { name: "Laboratoire Informatique", type: "LABORATOIRE" } }),
      prisma.location.create({ data: { name: "Laboratoire Réseaux", type: "LABORATOIRE" } }),
      prisma.location.create({ data: { name: "Laboratoire Électronique", type: "LABORATOIRE" } }),
      prisma.location.create({ data: { name: "Laboratoire Mathématiques", type: "LABORATOIRE" } }),
      prisma.location.create({ data: { name: "Magasin Central", type: "SERVICE" } }),
    ]);

    const [catOrdi, catImprimante, catServeur, catReseau, catInstruments, catMobilier] = await Promise.all([
      prisma.category.create({ data: { name: "Ordinateur" } }),
      prisma.category.create({ data: { name: "Imprimante" } }),
      prisma.category.create({ data: { name: "Serveur" } }),
      prisma.category.create({ data: { name: "Réseau" } }),
      prisma.category.create({ data: { name: "Instruments" } }),
      prisma.category.create({ data: { name: "Mobilier" } }),
    ]);

    const [hashLog, hashMag, hashLab1, hashLab2] = await Promise.all([
      bcrypt.hash("logistique123", 10),
      bcrypt.hash("magasinier123", 10),
      bcrypt.hash("labo123", 10),
      bcrypt.hash("labo2_123", 10),
    ]);

    const [userLog, userMag, userLab1, userLab2] = await Promise.all([
      prisma.user.create({
        data: { firstName: "Ahmed", lastName: "Benali", username: "logistique", email: "logistique@univ.dz", password: hashLog, role: "LOGISTIQUE", jobTitle: "Responsable Logistique", activated: true },
      }),
      prisma.user.create({
        data: { firstName: "Karim", lastName: "Meziane", username: "magasinier", email: "magasinier@univ.dz", password: hashMag, role: "MAGASINIER", jobTitle: "Magasinier", activated: true },
      }),
      prisma.user.create({
        data: { firstName: "Fatima", lastName: "Hadj", username: "labo1", email: "labo1@univ.dz", password: hashLab1, role: "LABORATOIRE", jobTitle: "Responsable Labo Informatique", laboratoireId: labInfo.id, activated: true },
      }),
      prisma.user.create({
        data: { firstName: "Mohamed", lastName: "Saadi", username: "labo2", email: "labo2@univ.dz", password: hashLab2, role: "LABORATOIRE", jobTitle: "Responsable Labo Réseaux", laboratoireId: labReseaux.id, activated: true },
      }),
    ]);

    const assets = await Promise.all([
      prisma.asset.create({ data: { assetTag: "EQ-001", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024001", categoryId: catOrdi.id, locationId: labInfo.id, statusId: enService.id, purchaseCost: 85000, purchaseDate: new Date("2023-01-15") } }),
      prisma.asset.create({ data: { assetTag: "EQ-002", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024002", categoryId: catOrdi.id, locationId: labInfo.id, statusId: enService.id, purchaseCost: 85000, purchaseDate: new Date("2023-01-15") } }),
      prisma.asset.create({ data: { assetTag: "EQ-003", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024003", categoryId: catOrdi.id, locationId: labInfo.id, statusId: enPanne.id, purchaseCost: 85000, purchaseDate: new Date("2023-01-15") } }),
      prisma.asset.create({ data: { assetTag: "EQ-004", name: "Dell OptiPlex 3080", reference: "DELL-3080", serial: "SN2024004", categoryId: catOrdi.id, locationId: labInfo.id, statusId: enService.id, purchaseCost: 95000, purchaseDate: new Date("2022-09-01") } }),
      prisma.asset.create({ data: { assetTag: "EQ-005", name: "Dell OptiPlex 3080", reference: "DELL-3080", serial: "SN2024005", categoryId: catOrdi.id, locationId: labInfo.id, statusId: enMaintenance.id, purchaseCost: 95000, purchaseDate: new Date("2022-09-01") } }),
      prisma.asset.create({ data: { assetTag: "EQ-006", name: "Imprimante HP LaserJet Pro", reference: "HP-M404N", serial: "SN2024006", categoryId: catImprimante.id, locationId: labInfo.id, statusId: enService.id, purchaseCost: 32000, purchaseDate: new Date("2023-03-10") } }),
      prisma.asset.create({ data: { assetTag: "EQ-007", name: "Switch Cisco Catalyst 2960", reference: "WS-C2960X-24", serial: "SN2024007", categoryId: catReseau.id, locationId: labReseaux.id, statusId: enService.id, purchaseCost: 145000, purchaseDate: new Date("2022-06-20") } }),
      prisma.asset.create({ data: { assetTag: "EQ-008", name: "Routeur Cisco ISR 1900", reference: "CISCO-1921", serial: "SN2024008", categoryId: catReseau.id, locationId: labReseaux.id, statusId: enService.id, purchaseCost: 195000, purchaseDate: new Date("2022-06-20") } }),
      prisma.asset.create({ data: { assetTag: "EQ-009", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024009", categoryId: catOrdi.id, locationId: labReseaux.id, statusId: enService.id, purchaseCost: 85000, purchaseDate: new Date("2023-01-15") } }),
      prisma.asset.create({ data: { assetTag: "EQ-010", name: "Serveur Dell PowerEdge T440", reference: "PE-T440", serial: "SN2024010", categoryId: catServeur.id, locationId: labReseaux.id, statusId: enService.id, purchaseCost: 380000, purchaseDate: new Date("2021-11-05") } }),
      prisma.asset.create({ data: { assetTag: "EQ-011", name: "Oscilloscope Tektronix TDS2024C", reference: "TDS2024C", serial: "SN2024011", categoryId: catInstruments.id, locationId: labElec.id, statusId: enService.id, purchaseCost: 235000, purchaseDate: new Date("2020-05-12") } }),
      prisma.asset.create({ data: { assetTag: "EQ-012", name: "Générateur de signal Keysight 33500B", reference: "33500B", serial: "SN2024012", categoryId: catInstruments.id, locationId: labElec.id, statusId: enPanne.id, purchaseCost: 185000, purchaseDate: new Date("2020-05-12") } }),
      prisma.asset.create({ data: { assetTag: "EQ-013", name: "Multimètre Fluke 87V", reference: "FLUKE-87V", serial: "SN2024013", categoryId: catInstruments.id, locationId: labElec.id, statusId: enService.id, purchaseCost: 48000, purchaseDate: new Date("2021-02-18") } }),
      prisma.asset.create({ data: { assetTag: "EQ-014", name: "Multimètre Fluke 87V", reference: "FLUKE-87V", serial: "SN2024014", categoryId: catInstruments.id, locationId: labElec.id, statusId: enService.id, purchaseCost: 48000, purchaseDate: new Date("2021-02-18") } }),
      prisma.asset.create({ data: { assetTag: "EQ-015", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024015", categoryId: catOrdi.id, locationId: stockRoom.id, statusId: enStock.id, purchaseCost: 85000, purchaseDate: new Date("2024-01-08") } }),
      prisma.asset.create({ data: { assetTag: "EQ-016", name: "HP ProBook 450 G8", reference: "HP-450-G8", serial: "SN2024016", categoryId: catOrdi.id, locationId: stockRoom.id, statusId: enStock.id, purchaseCost: 85000, purchaseDate: new Date("2024-01-08") } }),
      prisma.asset.create({ data: { assetTag: "EQ-017", name: "Câble réseau Cat6 (lot 50m)", reference: "CAT6-50M", serial: null, categoryId: catReseau.id, locationId: stockRoom.id, statusId: enStock.id, purchaseCost: 4500, quantity: 10 } }),
      prisma.asset.create({ data: { assetTag: "EQ-018", name: "Switch Cisco Catalyst 2960", reference: "WS-C2960X-24", serial: "SN2024018", categoryId: catReseau.id, locationId: stockRoom.id, statusId: enStock.id, purchaseCost: 145000, purchaseDate: new Date("2024-02-01") } }),
      prisma.asset.create({ data: { assetTag: "EQ-019", name: "Chaises de bureau (lot)", reference: "CH-BUREAU", serial: null, categoryId: catMobilier.id, locationId: labInfo.id, statusId: enService.id, purchaseCost: 9500, quantity: 25 } }),
      prisma.asset.create({ data: { assetTag: "EQ-020", name: "Tableau interactif Smart Board", reference: "SMART-7086", serial: "SN2024020", categoryId: catInstruments.id, locationId: labMath.id, statusId: reforme.id, purchaseCost: 320000, purchaseDate: new Date("2018-03-22") } }),
    ]);

    await prisma.equipmentRequest.createMany({
      data: [
        {
          title: "Achat de 5 ordinateurs portables HP ProBook",
          description: "Les ordinateurs actuels du Lab Informatique sont vétustes. Nous avons besoin de 5 nouveaux portables pour les TP de programmation du S2.",
          type: "ACHAT",
          quantity: 5,
          urgency: "HAUTE",
          status: "EN_ATTENTE",
          requesterId: userLab1.id,
          laboratoireId: labInfo.id,
        },
        {
          title: "Remplacement du générateur de signal en panne (EQ-012)",
          description: "Le générateur EQ-012 est en panne depuis 3 semaines. Les TP d'électronique sont bloqués. Remplacement urgent nécessaire.",
          type: "REMPLACEMENT",
          quantity: 1,
          urgency: "HAUTE",
          status: "EN_ATTENTE",
          requesterId: userLab1.id,
          laboratoireId: labInfo.id,
        },
        {
          title: "Réforme du tableau interactif Smart Board (EQ-020)",
          description: "Le tableau interactif EQ-020 est hors service depuis 2022, réparation impossible. Demande de mise en réforme et remplacement.",
          type: "REFORME",
          quantity: 1,
          urgency: "NORMALE",
          status: "EN_ATTENTE",
          requesterId: userLab1.id,
          laboratoireId: labInfo.id,
        },
        {
          title: "Achat d'une imprimante laser pour le Laboratoire Réseaux",
          description: "Besoin d'une imprimante pour imprimer les rapports de TP.",
          type: "ACHAT",
          quantity: 1,
          urgency: "NORMALE",
          status: "APPROUVEE",
          requesterId: userLab2.id,
          laboratoireId: labReseaux.id,
          reviewerId: userLog.id,
          reviewNote: "Approuvée. Commande en cours, livraison prévue dans 2 semaines.",
          reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Remplacement des câbles HDMI défaillants",
          description: "Remplacement des câbles HDMI usagés dans les salles de TP réseaux.",
          type: "REMPLACEMENT",
          quantity: 10,
          urgency: "BASSE",
          status: "REJETEE",
          requesterId: userLab2.id,
          laboratoireId: labReseaux.id,
          reviewerId: userLog.id,
          reviewNote: "Rejetée. Des câbles identiques sont disponibles en stock au magasin central.",
          reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    await Promise.all([
      prisma.equipmentMovement.create({ data: { type: "ENTREE", quantity: 1, reference: "BL-2024-001", note: "Réception HP ProBook 450 G8 — bon de livraison fournisseur", assetId: assets[0].id, toLocationId: labInfo.id, doneById: userMag.id } }),
      prisma.equipmentMovement.create({ data: { type: "ENTREE", quantity: 1, reference: "BL-2024-002", note: "Réception switch Cisco — nouvelle commande", assetId: assets[17].id, toLocationId: stockRoom.id, doneById: userMag.id } }),
      prisma.equipmentMovement.create({ data: { type: "SORTIE", quantity: 1, reference: "BS-2024-001", note: "Envoi en réparation externe — générateur en panne", assetId: assets[11].id, fromLocationId: labElec.id, doneById: userMag.id } }),
      prisma.equipmentMovement.create({ data: { type: "TRANSFERT", quantity: 1, reference: "BT-2024-001", note: "Transfert du stock vers Lab Informatique", assetId: assets[14].id, fromLocationId: stockRoom.id, toLocationId: labInfo.id, doneById: userMag.id } }),
      prisma.equipmentMovement.create({ data: { type: "ENTREE", quantity: 1, reference: "BL-2024-003", note: "Réception Dell OptiPlex 3080", assetId: assets[3].id, toLocationId: labInfo.id, doneById: userMag.id } }),
    ]);

    await prisma.setting.create({ data: { siteName: "GestActif — Université" } });

    return NextResponse.json({ success: true, message: "Données de démonstration créées avec succès" });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const userCount = await prisma.user.count();
  const requestCount = await prisma.equipmentRequest.count();
  return NextResponse.json({ seeded: userCount > 0, userCount, requestCount });
}
