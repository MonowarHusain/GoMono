"use client";

import QrStudioModal from "@/components/qr/QrStudio";

export default function QRCodeModal({ url, onClose }: { url: string; onClose: () => void }) {
    return <QrStudioModal isOpen={true} onClose={onClose} url={url} />;
}
