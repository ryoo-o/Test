const USER_ID='1378992137105838175';

export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const token=process.env.DISCORD_BOT_TOKEN;
  if(!token)return res.status(500).end();

  try{
    const r=await fetch(`https://discord.com/api/v10/users/${USER_ID}`,{
      headers:{Authorization:`Bot ${token}`}
    });

    if(!r.ok)return res.status(r.status).end();

    const u=await r.json();
    const hash=u.avatar;
    const type=hash?.startsWith('a_')?'gif':'png';
    const avatar=hash
      ? `https://cdn.discordapp.com/avatars/${USER_ID}/${hash}.${type}?size=512`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(USER_ID)%5n)}.png`;

    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Location',avatar);
    return res.status(302).end();
  }catch{
    return res.status(500).end();
  }
}
