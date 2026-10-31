import LinkExpiredView from "@/components/public/LinkExpiredView";

export const metadata = {
    title: "Link Expired or Limit Reached",
    description: "This link has expired or reached its maximum click limit.",
};

export default function BurnedPage() {
    return (
        <LinkExpiredView
            alias="link"
            isLimitReached={true}
        />
    );
}
