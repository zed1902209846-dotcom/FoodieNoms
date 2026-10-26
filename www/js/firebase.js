import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  updateDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBewE3G8WS_8uafoIsMzriTEHDUy-uIxW8",
  authDomain: "foodienoms-ce6f5.firebaseapp.com",
  projectId: "foodienoms-ce6f5",
  storageBucket: "foodienoms-ce6f5.firebasestorage.app",
  messagingSenderId: "644373722607",
  appId: "1:644373722607:web:91fa37db5bd5807ab7721a",
  measurementId: "G-ZM5YFFPB17"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// In the iOS app, getAuth() never finishes signing in inside WKWebView,
// so native builds set up Auth with IndexedDB persistence directly.
export const auth = window.Capacitor?.isNativePlatform?.()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

console.log("Firebase initialization successful:", app.options.projectId);

window.FN = window.FN || {};

window.FN.registerStudentAccount = async function (email, password, profile) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = credential.user;

  await setDoc(doc(db, "users", user.uid), {
    name: profile.name,
    email: user.email,
    campus: profile.campus,
    role: "student",
    createdAt: serverTimestamp()
  });

  console.log("Student account and profile created:", user.uid);

  await signOut(auth);

  return user.uid;
};

window.FN.loginStudentAccount = async function (email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const profileSnapshot = await getDoc(doc(db, "users", user.uid));

  if (!profileSnapshot.exists()) {
    await signOut(auth);

    const error = new Error("Student profile not found.");
    error.code = "auth/student-profile-not-found";
    throw error;
  }

  const profile = profileSnapshot.data();

  if (profile.role !== "student") {
    await signOut(auth);
    const error = new Error("This is not a student account.");
    error.code = "auth/not-student-account";
    throw error;
  }

  console.log("Student signed in:", user.uid);

  return {
    uid: user.uid,
    ...profile
  };
};

window.FN.registerVendorAccount = async function (email, password, profile) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await setDoc(doc(db, "users", user.uid), {
    name: profile.name,
    email: user.email,
    role: "vendor",
    category: profile.category,
    phone: profile.phone,
    address: profile.address,
    campus: profile.campus,
    opens: profile.opens,
    closes: profile.closes,
    createdAt: serverTimestamp()
  });

  console.log("Vendor account and profile created:", user.uid);

  await signOut(auth);

  return user.uid;
};

window.FN.loginVendorAccount = async function (email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const profileSnapshot = await getDoc(doc(db, "users", user.uid));

  if (!profileSnapshot.exists()) {
    await signOut(auth);

    const error = new Error("Vendor profile not found.");
    error.code = "auth/vendor-profile-not-found";
    throw error;
  }

  const profile = profileSnapshot.data();

  if (profile.role !== "vendor") {
    await signOut(auth);

    const error = new Error("This is not a vendor account.");
    error.code = "auth/not-vendor-account";
    throw error;
  }

  console.log("Vendor signed in:", user.uid);

  return {
    uid: user.uid,
    ...profile
  };
};
   

window.FN.publishListing = async function (listing) {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  const documentRef = await addDoc(collection(db, "listings"), {
    vendorId: user.uid,
    name: listing.name,
    category: listing.category,
    orig: listing.orig,
    price: listing.price,
    left: listing.left,
    from: listing.from,
    to: listing.to,
    description: listing.description,
    visible: true,
    createdAt: serverTimestamp()
  });

  console.log("Listing published:", documentRef.id);

  return documentRef.id;
};

window.FN.updateListing = async function (listingId, listing) {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  await updateDoc(doc(db, "listings", listingId), {
    name: listing.name,
    category: listing.category,
    orig: listing.orig,
    price: listing.price,
    left: listing.left,
    from: listing.from,
    to: listing.to,
    description: listing.description
  });
};

window.FN.setListingVisibility = async function (listingId, visible) {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  await updateDoc(doc(db, "listings", listingId), {
    visible: Boolean(visible)
  });
};


window.FN.loadVisibleListings = async function () {
  const listingsQuery = query(
    collection(db, "listings"),
    where("visible", "==", true)
  );

  const snapshot = await getDocs(listingsQuery);

  const listings = snapshot.docs
    .map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }))
    .sort((firstListing, secondListing) =>
      String(firstListing.to || "").localeCompare(
        String(secondListing.to || "")
      )
    );

  console.log("Visible Firestore listings loaded:", listings);

  return listings;
};

window.FN.loadVendorListings = async function () {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  const snapshot = await getDocs(
    query(
      collection(db, "listings"),
      where("vendorId", "==", user.uid)
    )
  );

  return snapshot.docs
    .map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }))
    .sort(
      (firstListing, secondListing) =>
        (secondListing.createdAt?.toMillis?.() || 0)
        - (firstListing.createdAt?.toMillis?.() || 0)
    );
};

window.FN.reserveListing = async function (listing) {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Student is not signed in.");
    error.code = "auth/student-not-signed-in";
    throw error;
  }

  const profileSnapshot = await getDoc(
    doc(db, "users", user.uid)
  );

  if (!profileSnapshot.exists()) {
    const error = new Error("Student profile was not found.");
    error.code = "auth/student-profile-not-found";
    throw error;
  }

  const studentProfile = profileSnapshot.data();

  if (studentProfile.role !== "student") {
    const error = new Error("This is not a student account.");
    error.code = "auth/not-student-account";
    throw error;
  }

  const listingReference = doc(db, "listings", listing.id);
  const reservationId = `${user.uid}_${listing.id}`;
  const reservationReference = doc(
    db,
    "reservations",
    reservationId
  );

  await runTransaction(db, async (transaction) => {
    const existingReservation = await transaction.get(
      reservationReference
    );

    if (existingReservation.exists()) {
      const error = new Error("This listing has already been reserved.");
      error.code = "reservation/already-exists";
      throw error;
    }

    const listingSnapshot = await transaction.get(listingReference);

    if (!listingSnapshot.exists()) {
      const error = new Error("Listing was not found.");
      error.code = "listing/not-found";
      throw error;
    }

    const currentListing = listingSnapshot.data();

    if (!currentListing.visible || currentListing.left <= 0) {
      const error = new Error("This listing is sold out.");
      error.code = "listing/sold-out";
      throw error;
    }

    transaction.update(listingReference, {
      left: currentListing.left - 1
    });

    transaction.set(reservationReference, {
      listingId: listing.id,
      vendorId: currentListing.vendorId,
      studentId: user.uid,
      studentName: studentProfile.name,
      quantity: 1,
      unitPrice: currentListing.price,
      pickupFrom: currentListing.from,
      pickupTo: currentListing.to,
      status: "reserved",
      createdAt: serverTimestamp()
    });
  });

  console.log("Reservation created:", reservationId);

  return reservationId;
};

async function enrichReservations(reservations) {
  const listingEntries = await Promise.all(
    reservations.map(async (reservation) => {
      let listingSnapshot;

      try {
        listingSnapshot = await getDoc(
          doc(db, "listings", reservation.listingId)
        );
      } catch (error) {
        console.warn(
          "Could not load the listing for reservation:",
          reservation.id,
          error
        );
        return [reservation.listingId, null];
      }

      return [
        reservation.listingId,
        listingSnapshot.exists() ? listingSnapshot.data() : null
      ];
    })
  );

  const listingsById = new Map(listingEntries);

  return reservations.map((reservation) => {
    const listing = listingsById.get(reservation.listingId) || {};

    return {
      ...reservation,
      listingName: listing.name || "Reserved food",
      listingCategory: listing.category || "Food",
      listingDescription: listing.description || "",
      listingOriginalPrice: listing.orig || reservation.unitPrice
    };
  });
}

window.FN.loadStudentReservations = async function () {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Student is not signed in.");
    error.code = "auth/student-not-signed-in";
    throw error;
  }

  const snapshot = await getDocs(
    query(
      collection(db, "reservations"),
      where("studentId", "==", user.uid)
    )
  );

  const reservations = snapshot.docs
    .map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }))
    .sort((firstReservation, secondReservation) => {
      const firstTime = firstReservation.createdAt?.toMillis?.() || 0;
      const secondTime = secondReservation.createdAt?.toMillis?.() || 0;
      return secondTime - firstTime;
    });

  return enrichReservations(reservations);
};

window.FN.loadVendorReservations = async function () {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  const snapshot = await getDocs(
    query(
      collection(db, "reservations"),
      where("vendorId", "==", user.uid)
    )
  );

  const reservations = snapshot.docs
    .map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }))
    .sort((firstReservation, secondReservation) => {
      const firstTime = firstReservation.createdAt?.toMillis?.() || 0;
      const secondTime = secondReservation.createdAt?.toMillis?.() || 0;
      return secondTime - firstTime;
    });

  return enrichReservations(reservations);
};

window.FN.markReservationCollected = async function (reservationId) {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error("Vendor is not signed in.");
    error.code = "auth/vendor-not-signed-in";
    throw error;
  }

  await updateDoc(doc(db, "reservations", reservationId), {
    status: "collected"
  });

  console.log("Reservation marked collected:", reservationId);
};

window.FN.firebaseSignOut = function () {
  return signOut(auth);
};
