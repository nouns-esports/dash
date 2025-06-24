// TODO: Search Params for showing quests, events, predictions, etc.

export default async function CommunityPage(props: {
    params: Promise<{ community: string }>;
}) {
    const params = await props.params;
    return <div>{params.community}</div>;
}
