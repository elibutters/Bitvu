import Link from 'next/link';
import Image from 'next/image';
import DNCoinDD from './DNCoinDD';
import DNExchDD from './DNExchDD';
import DNTypeDD from './DNTypeDD';

export default function DashNav() {
    return (
      <nav className="flex items-center bg-gradient-to-t from-[#0d0d0d] to-[#1e1e1e] p-[0.22rem_0.6rem] relative">
        <div className="flex items-center gap-8 py-3 px-4 mr-px relative">
          <Link 
            href="/" 
            className="flex pr-4 -mb-5 -ml-[10px] hover:opacity-80"
          >
            <Image
              src="/bitvu_favicon.svg"
              alt="logo"
              height={40}
              width={40}
              className="w-[41px] h-[41px] object-cover -mt-[5px] -mb-[10px] pr-[7px]"
            />
            <Image
              src="/name_logo.svg"
              alt="name_logo"
              height={40}
              width={40}
              className="h-[70px] w-[70px] -mt-5"
            />
          </Link>
          <div className="inline-flex">
            <DNCoinDD/>
            <DNExchDD/>
            <DNTypeDD/>
          </div>
        </div>
        <div className="ml-auto pr-[0.8rem] font-semibold font-ibm-plex-sans">
          Log in
        </div>
      </nav>
    );
  }