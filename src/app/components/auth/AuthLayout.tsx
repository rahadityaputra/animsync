import Image from "next/image";
// Components/auth/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string | React.ReactNode;
  showTwoColumns?: boolean;
}

const AuthLayout = ({
  children,
  title,
  subtitle,
  showTwoColumns = false,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Kolom Kiri (Form) */}
      <div
        className={`flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
          showTwoColumns ? "w-1/2" : "w-full"
        }`}
      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Kolom Kanan (Logo/Gambar) - hanya muncul jika showTwoColumns true */}
      {showTwoColumns && (
        <div className="hidden md:flex items-center justify-center bg-white w-1/2 p-12">
          <div className="max-w-lg">
            {/* Ganti dengan gambar logo Anda */}
            <Image
              src="/images/logo-anim-sinc.png"
              alt="Company Logo"
              width={500}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
