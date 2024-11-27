const admin = require("firebase-admin");
const serviceAccount = require("../falkordb-firebase-adminsdk-k7l69-dfbe50f748.json"); // Baixe a chave de serviço no Console do Firebase

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "falkordb", // Use o `projectId` do firebaseConfig
  });
}

const db = admin.firestore();
module.exports = { admin, db };
