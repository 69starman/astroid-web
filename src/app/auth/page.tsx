'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Globe, ArrowRight, Shield } from 'lucide-react';
import { setAllowed, getAddress } from '@stellar/freighter-api';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFreighterLogin = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const allowed = await setAllowed();
      if (!allowed) {
        throw new Error('Freighter connection request was rejected.');
      }
      
      const publicKey = await getAddress();
      if (!publicKey) {
        throw new Error('Could not retrieve public key from Freighter.');
      }

      // Transition to dashboard upon successful connection
      router.push('/overview');
    } catch (err: any) {
      console.error('Freighter login failed:', err);
      setError(err.message || 'Failed to connect to Freighter wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden p-6 selection:bg-gold/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-5" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface/80 p-8 shadow-soft-2 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-gold hover:opacity-90 transition-opacity">
            <Sparkles className="h-7 w-7" aria-hidden />
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">Authenticate</h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            Connect your Stellar wallet to access the Astroid Financial OS.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleFreighterLogin}
            disabled={isConnecting}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-md bg-foreground px-6 py-3.5 text-base font-medium text-background transition-transform active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gold/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {isConnecting ? (
              <>
                <Globe className="h-5 w-5 animate-spin" />
                <span>Connecting Freighter...</span>
              </>
            ) : (
              <>
                <Globe className="h-5 w-5" />
                <span>Connect Freighter</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 text-center text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-border/50 pt-6 text-xs text-foreground-muted">
          <Shield className="h-3.5 w-3.5" />
          <span>Non-custodial. We never store your secret keys.</span>
        </div>
      </motion.div>
    </div>
  );
}
