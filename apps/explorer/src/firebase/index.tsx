
'use client';

import { initializeFirebase, auth, db } from './init';

// Sub-module imports
import { useFirebase, useFirestore as useFirestoreHook, useAuth, useMemoFirebase } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { 
  setDocumentNonBlocking, 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from './non-blocking-updates';

// Re-export specific hooks to satisfy the @/firebase alias
export {
  initializeFirebase,
  auth,
  db,
  useFirebase,
  useAuth,
  useMemoFirebase,
  useCollection,
  useDoc,
  useUser,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
};

// Map useFirestore to the hook specifically to avoid naming conflict with the Firestore type
export const useFirestore = useFirestoreHook;

export * from './provider';
export * from './client-provider';
export * from './auth/use-oauth-sign-in';
