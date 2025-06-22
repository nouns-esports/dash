export default async function ChatPage(props: {
	params: Promise<{ community: string }>;
}) {
	const params = await props.params;
	return <div>{params.community}</div>;
}
