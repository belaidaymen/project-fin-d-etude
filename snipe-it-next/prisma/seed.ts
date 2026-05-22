import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedUser = await bcrypt.hash("password123", 10);

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: "GestActifs",
      siteSubtitle: "Gestion des Actifs Universitaires",
      primaryColor: "#3c8dbc",
      currency: "DZD",
      timezone: "Africa/Algiers",
      perPage: 20,
    },
  });

  const categories = await Promise.all([
    prisma.categorie.upsert({ where: { nom: "Informatique" }, update: {}, create: { nom: "Informatique", description: "Ordinateurs, laptops, serveurs" } }),
    prisma.categorie.upsert({ where: { nom: "Mobilier" }, update: {}, create: { nom: "Mobilier", description: "Tables, chaises, armoires" } }),
    prisma.categorie.upsert({ where: { nom: "Électronique" }, update: {}, create: { nom: "Électronique", description: "Projecteurs, écrans, appareils" } }),
    prisma.categorie.upsert({ where: { nom: "Instruments de mesure" }, update: {}, create: { nom: "Instruments de mesure", description: "Oscilloscopes, multimètres, etc." } }),
    prisma.categorie.upsert({ where: { nom: "Réseau" }, update: {}, create: { nom: "Réseau", description: "Switches, routeurs, câbles" } }),
  ]);

  const fournisseurs = await Promise.all([
    prisma.fournisseur.upsert({ where: { id: 1 }, update: {}, create: { nom: "TechAlgérie SARL", contact: "Ahmed Benali", email: "contact@techalg.dz", telephone: "021-234-567", adresse: "Zone industrielle, Alger" } }),
    prisma.fournisseur.upsert({ where: { id: 2 }, update: {}, create: { nom: "InfoPro Distribution", contact: "Karim Meziani", email: "info@infopro.dz", telephone: "021-987-654" } }),
  ]);

  const localisations = await Promise.all([
    prisma.localisation.upsert({ where: { id: 1 }, update: {}, create: { nom: "Salle A101", type: "SALLE", batiment: "Bloc A", etage: "1er étage", capacite: 30 } }),
    prisma.localisation.upsert({ where: { id: 2 }, update: {}, create: { nom: "Salle A102", type: "SALLE", batiment: "Bloc A", etage: "1er étage", capacite: 25 } }),
    prisma.localisation.upsert({ where: { id: 3 }, update: {}, create: { nom: "Laboratoire Réseaux", type: "LABORATOIRE", batiment: "Bloc B", etage: "RDC", capacite: 20 } }),
    prisma.localisation.upsert({ where: { id: 4 }, update: {}, create: { nom: "Laboratoire Électronique", type: "LABORATOIRE", batiment: "Bloc B", etage: "1er étage", capacite: 15 } }),
    prisma.localisation.upsert({ where: { id: 5 }, update: {}, create: { nom: "Service Informatique", type: "SERVICE", batiment: "Bloc Admin", etage: "2ème étage" } }),
    prisma.localisation.upsert({ where: { id: 6 }, update: {}, create: { nom: "Entrepôt Central", type: "ENTREPOT", batiment: "Bloc C", etage: "RDC" } }),
  ]);

  const admin = await prisma.user.upsert({ where: { username: "admin" }, update: {}, create: { nom: "Administrateur", prenom: "Système", email: "admin@universite.dz", username: "admin", password: hashedAdmin, role: "ADMIN", actif: true } });
  const magasinier = await prisma.user.upsert({ where: { username: "magasinier" }, update: {}, create: { nom: "Khelifi", prenom: "Samir", email: "s.khelifi@universite.dz", username: "magasinier", password: hashedUser, role: "MAGASINIER", actif: true, telephone: "0661-987-654" } });
  const logisticien = await prisma.user.upsert({ where: { username: "logisticien" }, update: {}, create: { nom: "Boudiaf", prenom: "Rachid", email: "r.boudiaf@universite.dz", username: "logisticien", password: hashedUser, role: "LOGISTICIEN", actif: true, telephone: "0550-123-456" } });
  const chefLabo = await prisma.user.upsert({ where: { username: "cheflabo" }, update: {}, create: { nom: "Meziane", prenom: "Leila", email: "l.meziane@universite.dz", username: "cheflabo", password: hashedUser, role: "CHEF_LABO", actif: true, telephone: "0770-456-789", localisationId: 3 } });

  const equipements = await Promise.all([
    prisma.equipement.upsert({ where: { reference: "PC-001" }, update: {}, create: { reference: "PC-001", nom: "PC Bureau HP ProDesk", marque: "HP", modele: "ProDesk 400", numeroSerie: "SN-HP-001", etat: "BON", categorieId: categories[0].id, fournisseurId: fournisseurs[0].id, quantite: 1, dateAcquisition: new Date("2023-01-15"), prixAcquisition: 85000 } }),
    prisma.equipement.upsert({ where: { reference: "PC-002" }, update: {}, create: { reference: "PC-002", nom: "Laptop Dell Latitude", marque: "Dell", modele: "Latitude 5520", etat: "BON", categorieId: categories[0].id, fournisseurId: fournisseurs[0].id, quantite: 1, dateAcquisition: new Date("2023-03-20"), prixAcquisition: 120000 } }),
    prisma.equipement.upsert({ where: { reference: "PRJ-001" }, update: {}, create: { reference: "PRJ-001", nom: "Vidéoprojecteur Epson", marque: "Epson", modele: "EB-X49", etat: "BON", categorieId: categories[2].id, fournisseurId: fournisseurs[1].id, quantite: 1, dateAcquisition: new Date("2022-09-01"), prixAcquisition: 65000 } }),
    prisma.equipement.upsert({ where: { reference: "OSC-001" }, update: {}, create: { reference: "OSC-001", nom: "Oscilloscope Numérique", marque: "Rigol", modele: "DS1054Z", etat: "BON", categorieId: categories[3].id, quantite: 1, dateAcquisition: new Date("2022-06-10"), prixAcquisition: 45000 } }),
    prisma.equipement.upsert({ where: { reference: "SW-001" }, update: {}, create: { reference: "SW-001", nom: "Switch 24 ports Cisco", marque: "Cisco", modele: "SG250-24", etat: "BON", categorieId: categories[4].id, fournisseurId: fournisseurs[0].id, quantite: 1, dateAcquisition: new Date("2023-05-12"), prixAcquisition: 95000 } }),
    prisma.equipement.upsert({ where: { reference: "PC-003" }, update: {}, create: { reference: "PC-003", nom: "PC Bureau Lenovo ThinkCentre", marque: "Lenovo", modele: "ThinkCentre M720", etat: "MOYEN", categorieId: categories[0].id, quantite: 1, dateAcquisition: new Date("2020-01-20"), prixAcquisition: 70000 } }),
    prisma.equipement.upsert({ where: { reference: "IMP-001" }, update: {}, create: { reference: "IMP-001", nom: "Imprimante Laser HP", marque: "HP", modele: "LaserJet Pro M404", etat: "EN_MAINTENANCE", categorieId: categories[2].id, fournisseurId: fournisseurs[1].id, quantite: 1, dateAcquisition: new Date("2021-11-05"), prixAcquisition: 40000 } }),
  ]);

  await prisma.affectation.createMany({
    data: [
      { equipementId: equipements[0].id, localisationId: localisations[0].id, quantite: 1, dateAffectation: new Date("2023-02-01"), notes: "PC principal salle A101", actif: true, createdParId: magasinier.id },
      { equipementId: equipements[2].id, localisationId: localisations[0].id, quantite: 1, dateAffectation: new Date("2022-09-15"), actif: true, createdParId: magasinier.id },
      { equipementId: equipements[3].id, localisationId: localisations[3].id, quantite: 1, dateAffectation: new Date("2022-07-01"), notes: "Lab électronique", actif: true, createdParId: magasinier.id },
      { equipementId: equipements[4].id, localisationId: localisations[2].id, quantite: 1, dateAffectation: new Date("2023-06-01"), actif: true, createdParId: magasinier.id },
    ],
    skipDuplicates: true,
  });

  await prisma.mouvement.createMany({
    data: [
      { equipementId: equipements[0].id, type: "ENTREE", quantite: 1, dateOperation: new Date("2023-01-15"), motif: "Réception commande fournisseur", destinationId: localisations[5].id, createdParId: magasinier.id },
      { equipementId: equipements[1].id, type: "ENTREE", quantite: 1, dateOperation: new Date("2023-03-20"), motif: "Réception commande fournisseur", destinationId: localisations[5].id, createdParId: magasinier.id },
      { equipementId: equipements[0].id, type: "TRANSFERT", quantite: 1, dateOperation: new Date("2023-02-01"), motif: "Affectation salle A101", sourceId: localisations[5].id, destinationId: localisations[0].id, createdParId: magasinier.id },
    ],
    skipDuplicates: true,
  });

  await prisma.maintenance.create({
    data: { equipementId: equipements[6].id, type: "CORRECTIVE", description: "Remplacement du rouleau d'impression", dateDebut: new Date("2024-04-01"), cout: 5000, statut: "EN_COURS", notes: "En attente de pièces de rechange" },
  });

  await prisma.demande.createMany({
    data: [
      { type: "ACHAT", titre: "Achat de 5 PC pour Lab Réseaux", description: "Besoin de 5 nouveaux ordinateurs pour le laboratoire réseaux afin de remplacer les anciens équipements", priorite: "HAUTE", statut: "EN_ATTENTE", createdParId: chefLabo.id, quantite: 5, justification: "Les machines actuelles sont obsolètes" },
      { type: "REMPLACEMENT", titre: "Remplacement imprimante IMP-001", description: "L'imprimante du service informatique est en panne fréquente", priorite: "NORMALE", statut: "EN_ATTENTE", createdParId: chefLabo.id, equipementId: equipements[6].id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Base de données initialisée avec succès !");
  console.log("  Comptes utilisateurs :");
  console.log("  - admin       / admin123    (ADMIN)");
  console.log("  - logisticien / password123 (LOGISTICIEN)");
  console.log("  - magasinier  / password123 (MAGASINIER)");
  console.log("  - cheflabo    / password123 (CHEF_LABO)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
