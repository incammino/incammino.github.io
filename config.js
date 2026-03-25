/* ================================================
   AMDG — config.js
   Configura Supabase per login e sincronizzazione
   cross-device. Senza questo, tutto funziona
   solo in locale sul dispositivo.

   SETUP (10 minuti):  
   1. Vai su https://supabase.com → crea account gratuito
   2. "New project" → dai un nome → crea
   3. SQL Editor → incolla ed esegui il SQL in SETUP.md
   4. Settings → API → copia i valori qui sotto

   ⚠️  ATTENZIONE — LA CHIAVE CORRETTA:
   Vai su Supabase → Settings → API
   Copia la chiave "anon (public)" — è una stringa lunga
   che inizia con "eyJ..." (è un JWT token).
   NON usare la "service_role" key (è privata).
   Se vedi solo una "publishable key" (sb_publishable_...),
   usa la sezione "API Keys" e cerca la chiave "anon".
   ================================================ */

var SUPABASE_URL = 'https://fabntpgbknrbxpfhxotw.supabase.co';   /* es: 'https://abcxyz.supabase.co' */
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYm50cGdia25yYnhwZmh4b3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTMyMTcsImV4cCI6MjA4OTg2OTIxN30.kIZfCCwia1lXLDE-47lgtG-Ib3dnFtEgqxdKp_khnew';   /* ← sostituisci con la chiave anon che inizia con eyJ... */
