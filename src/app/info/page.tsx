// app/info/page.tsx
export default function InfoPage() {
  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ color: '#1a6b3c', marginBottom: '20px' }}>Informații Salariale 2026</h1>
      <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', fontSize: '1.1rem' }}>
        Secțiunea este în curs de actualizare conform noilor reglementări fiscale (Salariu minim 4.325 lei). 
        Momentan poți folosi calculatorul principal pentru simulări brute/nete.
      </p>
      <a href="/" style={{ 
        background: '#1a6b3c', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '8px', 
        textDecoration: 'none',
        fontWeight: 'bold' 
      }}>
        Mergi la Calculatorul Principal
      </a>
    </div>
  );
}