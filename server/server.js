import { config as dotenvConfig } from "dotenv";
import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from 'http';


import fileUpload from "express-fileupload";
import {
   getStorage,
   ref,
   uploadBytes,
   getDownloadURL,
   deleteObject,
} from "firebase/storage";
import { db } from "./firebase.js";
import {
   collection,
   addDoc,
   query,
   where,
   getDocs,
   doc,
   updateDoc,
   deleteDoc,
   getCountFromServer
} from "firebase/firestore";

dotenvConfig();

const storage = getStorage();
const app = express();
const port = 5000;
const usersCollection = collection(db, "users");
const httpServer = createServer(app)
const io = new Server(httpServer, {cors: {origin: '*'}})

io.on('connection', (socket) => {
   console.log('Server: Connection established ', socket.id)

   socket.on('disconnect',(reason)=>{
      console.log('Server: Client Disconnect ', reason, socket.id)
   })


})

app.use(cors());
app.use(fileUpload());
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });
//app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

// Define a simple route
app.get("/", (req, res) => {
   res.send("Hello Bohra Connect Server!");
});

app.get("/bohra-count", async (req, res) => {
   try{
      const snapshot = await getCountFromServer(usersCollection);
      const totalCount = snapshot.data().count
      console.log('Total Documents count: ', totalCount);
      res.status(200).json({bohraCount: totalCount});
   } catch(error){
      console.error("Error getting total document count", error);
      res.status(400).send(error);
   }
   
});

app.get("/bohras", async (req, res) => {
   try {
      const querySnapshot = await getDocs(usersCollection);
      const users = querySnapshot.docs.map((doc) => {
         const copiedObject = { ...doc.data() };
         //delete copiedObject["ejamaat"];
         return copiedObject;
      });
      console.log('all documents fetched from database')
      res.status(200).send(users);
   } catch (error) {
      console.error("Error getting all users:", error);
      res.status(400).send(error);
   }
});

app.post("/ejamaat", async (req, res) => {
   console.log(req.body.ejamaat);
   const q = query(usersCollection, where('ejamaat', '==', req.body.ejamaat));
   getDocs(q)
      .then((querySnapshot) => {
         if (querySnapshot.size > 0) {
            // A document with the specified value exists
            console.log("Document with the specified value exists.");
            return res.status(409).send('User already exists');
         } else {
            console.log("No document with the specified value exists.");
            res.status(200).send("Ejamaat does not exist, go ahead")
         }
      })
      .catch((error) => {
         console.error("Error checking for document:", error);
         return res.status(409).send('Error checking for document');
      });
});

app.post("/bohras", async (req, res) => {
   let record = {
      lngLat: req.body.lngLat,
      ejamaat: req.body.ejamaat,
      fullName: req.body.fullName,
      url: req.body.url,
      profession: req.body.profession,
   };

   try {
      const docRef = await addDoc(collection(db, "users"), record);
      console.log("Document written with ID: ", docRef.id);
      io.emit("new-bohra", {lngLat: record.lngLat, ejamaat: record.ejamaat, fullName:record.fullName});
      if(!req.files){
         res.status(200).send("Document added successfully");
         return
      }

      const selectedFile = req.files.profilePic;
      const path = `images/${docRef.id}/${selectedFile.name}`;
      const storageRef = ref(storage, path);
      const fileRef = ref(storage, path);

      uploadBytes(storageRef, selectedFile.data).then(() => {
         console.log("PDF uploaded successfully.");
         getDownloadURL(fileRef).then(async (url) => {
            const userDocRef = doc(db, "users", docRef.id);
            record.downloadUrl = url;
            // Using async/await
            try {
               await updateDoc(userDocRef, record);
               console.log("Document updated successfully");
               res.status(200).send("Document updates successfully");
            } catch (error) {
               res.status(500).send(error.message); // Send the error message as the response
               console.error("Error updating document: ", error);
            }
         });
      });
   } catch (error) {
      res.status(500).send(error.message);
      console.error("Error adding document: ", error);
   }
});


httpServer.listen(process.env.PORT || port, err=> {
   if(err) console.log(err)
   console.log('Server running on Port ', port)
})

