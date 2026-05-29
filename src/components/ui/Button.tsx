export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button {...props} className={`bg-white text-black px-4 py-2 rounded-md ${props.className || ''}`} />;
}
