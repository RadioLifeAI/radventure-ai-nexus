
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2 } from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const { subscribe, isSubscribing } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const success = await subscribe(email);
    if (success) {
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <div className="flex-1">
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-cyan-400"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubscribing}
        className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold whitespace-nowrap"
      >
        {isSubscribing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscrevendo...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Inscrever
          </>
        )}
      </Button>
    </form>
  );
}
