export async function getData(): Promise<{ pesan: string }> {
  // Melakukan fetch ke endpoint API FastAPI
  const res: Response = await fetch("http://localhost:8000/api/data", {
    cache: 'no-store' // Opsi ini mencegah caching respons pada saat development
  });

  // Memeriksa apakah respons dari server sukses (status code 2xx)
  if (!res.ok) {
    // Jika respons tidak sukses, lempar error dengan pesan yang deskriptif
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  // Mengurai respons menjadi JSON dan mengembalikannya dengan tipe yang spesifik
  // Asumsi struktur data yang dikembalikan adalah { pesan: string }
  return res.json() as Promise<{ pesan: string }>;
}
