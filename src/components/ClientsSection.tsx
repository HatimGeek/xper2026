import { useClients } from "@/hooks/useSupabaseQuery";
import { Building2 } from "lucide-react";

export const ClientsSection = () => {
  const { data: clients = [], isLoading } = useClients();

  if (isLoading || clients.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-muted-foreground">
            Des grandes surfaces et entreprises qui ont choisi notre savoir-faire
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center">
          {clients.map((client: any) => (
            <div
              key={client.id}
              className="flex items-center justify-center p-4 transition-all"
            >
              {client.website_url ? (
                <a
                  href={client.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={client.logo_url}
                    alt={client.name}
                    className="max-w-full max-h-20 object-contain transition-all hover:scale-110"
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="max-w-full max-h-20 object-contain transition-all"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
