import { products } from "@/src/content/products";

export function PlanMockup() {
  return <div className="plan-mockup" aria-label="Representação visual dos cinco Planos de Execução">{products.map((product, i) => <div className={`book book-${i + 1}`} key={product.key}><span>PROTOCOLO DA EVOLUÇÃO</span><b>{product.name}</b><i>{product.number}</i></div>)}</div>;
}
