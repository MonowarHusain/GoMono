export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`border rounded-md px-3 py-2 ${props.className || ''}`} />;
}
