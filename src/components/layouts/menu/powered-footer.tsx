import GithubIcon from "@/components/icons/github";
import Link from "next/link";

export default function PoweredFooter() {
  return (
    <div className='flex flex-col justify-center items-center text-xs p-2 text-gray-400 bg-gray-100 border-t-2 border-t-white'>
      <p>Powered by </p>
      <div className='flex items-center gap-1'>
        <Link
          target='_blank'
          href={"https://github.com/lawalletio/walias"}
          className='group'
        >
          <GithubIcon
            width={16}
            height={16}
            className='fill-gray-400 group-hover:fill-blue-500'
          />
        </Link>{" "}
        <Link
          className='font-bold hover:text-blue-500'
          href='https://walias.io'
          target='_blank'
        >
          walias.io
        </Link>{" "}
        <i>(v0.1.0)</i>
      </div>
    </div>
  );
}
