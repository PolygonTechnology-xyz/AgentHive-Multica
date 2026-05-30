import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./profile-public.module.css";

type PublicProfile = {
  displayName?: string | null;
  display_name?: string | null;
  handle: string;
  bio?: string | null;
  skills?: string[] | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  joinedAt?: string | null;
  joined_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
};

type WrappedProfile = { data?: PublicProfile };
type PageParams = { params: { handle: string } };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

function profileEndpoint(handle: string) {
  return `${API_URL}/users/by-handle/${encodeURIComponent(handle)}`;
}

async function getProfile(handle: string): Promise<PublicProfile | null> {
  const response = await fetch(profileEndpoint(handle), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to load freelancer profile");
  const body = (await response.json()) as WrappedProfile | PublicProfile;
  return "data" in body && body.data ? body.data : (body as PublicProfile);
}

function displayName(profile: PublicProfile) {
  return profile.displayName ?? profile.display_name ?? profile.handle;
}

function photoUrl(profile: PublicProfile) {
  return profile.photoUrl ?? profile.photo_url ?? null;
}

function joinedAt(profile: PublicProfile) {
  return profile.joinedAt ?? profile.joined_at ?? profile.createdAt ?? profile.created_at ?? null;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatJoinDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const profile = await getProfile(params.handle);
  if (!profile) return { title: "Freelancer not found | AgentHive" };
  const name = displayName(profile);
  const description = profile.bio ? profile.bio.slice(0, 155) : `View ${name}'s AgentHive freelancer profile.`;
  return { title: `${name} | AgentHive Freelancer`, description };
}

export default async function Page({ params }: PageParams) {
  const profile = await getProfile(params.handle);
  if (!profile) notFound();

  const name = displayName(profile);
  const image = photoUrl(profile);
  const joinDate = formatJoinDate(joinedAt(profile));
  const skills = profile.skills ?? [];

  return (
    <main className={styles.page}>
      <section className={styles.header} aria-labelledby="profile-title">
        {image ? <Image className={styles.avatarImage} src={image} alt="" width={112} height={112} unoptimized /> : <div className={styles.avatar}>{initialsFor(name)}</div>}
        <div>
          <p className={styles.eyebrow}>Freelancer profile</p>
          <h1 id="profile-title" className={styles.title}>{name}</h1>
          <p className={styles.handle}>@{profile.handle}</p>
        </div>
      </section>

      {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}

      <div className={styles.meta}>
        {joinDate ? <span>Joined {joinDate}</span> : <span>AgentHive freelancer</span>}
      </div>

      {skills.length > 0 ? (
        <ul className={styles.skills} aria-label="Skills">
          {skills.map((skill) => <li key={skill} className={styles.skill}>{skill}</li>)}
        </ul>
      ) : null}
    </main>
  );
}
