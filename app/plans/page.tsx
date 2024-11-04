"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Plans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const handleSubscribe = (plan: string) => {
    console.log(`Subscribing to ${plan} plan`);
    // Aqui você pode adicionar qualquer lógica adicional necessária para finalizar a instalação da integração
    if (next) {
      router.push(next); // Redireciona para o link `next` fornecido na URL
    } else {
      console.error("Next URL is not provided");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Basic Plan</h2>
          <p className="mt-2">Description of the basic plan.</p>
          <button
            className="bg-black text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubscribe("Basic")}
          >
            Subscribe
          </button>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Pro Plan</h2>
          <p className="mt-2">Description of the pro plan.</p>
          <button
            className="bg-black text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubscribe("Pro")}
          >
            Subscribe
          </button>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Enterprise Plan</h2>
          <p className="mt-2">Description of the enterprise plan.</p>
          <button
            className="bg-black text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubscribe("Enterprise")}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}