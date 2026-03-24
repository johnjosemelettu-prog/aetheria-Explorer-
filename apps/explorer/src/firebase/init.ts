
'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

export let auth: Auth;
export let db: Firestore;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!appInstance) {
      if (!getApps().length) {
        try {
          appInstance = initializeApp(firebaseConfig);
        } catch (e) {
          appInstance = getApp();
        }
      } else {
        appInstance = getApp();
      }
    }

    if (!authInstance) authInstance = getAuth(appInstance);
    if (!firestoreInstance) {
      const dbId = (firebaseConfig as any).firestoreDatabaseId;
      firestoreInstance = dbId ? getFirestore(appInstance, dbId) : getFirestore(appInstance);
    }

    auth = authInstance!;
    db = firestoreInstance!;

    return {
      firebaseApp: appInstance!,
      auth: authInstance!,
      firestore: firestoreInstance!
    };
  }

  return {
    firebaseApp: null as unknown as FirebaseApp,
    auth: null as unknown as Auth,
    firestore: null as unknown as Firestore
  };
}
