
'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Use global variables to cache instances and prevent multiple initializations in HMR
let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!appInstance) {
      if (getApps().length === 0) {
        try {
          appInstance = initializeApp(firebaseConfig);
        } catch (e) {
          console.warn('Firebase initialization warning:', e);
          appInstance = getApp();
        }
      } else {
        appInstance = getApp();
      }
    }

    if (!authInstance) authInstance = getAuth(appInstance);
    if (!firestoreInstance) firestoreInstance = getFirestore(appInstance);

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

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-oauth-sign-in';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
