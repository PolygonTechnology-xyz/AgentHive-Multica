"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card/Card";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./profile.module.css";

type Profile = {
  id: string;
  email?: string;
  displayName: string;
  bio: string | null;
  skills: string[];
  handle: string;
  photoUrl: string | null;
  joinedAt?: string;
};

type ProfileResponse = { data: Profile };
type FieldErrors = Partial<Record<"displayName" | "handle" | "bio" | "photo", string>>;
type PhotoUploadResponse = { data?: { photoUrl?: string | null; photo_url?: string | null }; photoUrl?: string | null; photo_url?: string | null };

const HANDLE_PATTERN = /^[a-z0-9-]{3,32}$/;
const MAX_BIO_LENGTH = 500;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"];

function initialsFor(name?: string | null, fallback?: string | null) {
  const source = (name || fallback || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function validateProfile(displayName: string, handle: string, bio: string) {
  const errors: FieldErrors = {};
  if (displayName.trim().length < 2) errors.displayName = "Display name must be at least 2 characters.";
  if (!HANDLE_PATTERN.test(handle.trim())) errors.handle = "Use 3-32 lowercase letters, numbers, or hyphens.";
  if (bio.length > MAX_BIO_LENGTH) errors.bio = "Bio must be 500 characters or less.";
  return errors;
}

function photoUrlFromResponse(response: PhotoUploadResponse) {
  return response.data?.photoUrl ?? response.data?.photo_url ?? response.photoUrl ?? response.photo_url ?? null;
}

export default function FreelancerAccountPage() {
  const { data, isLoading, mutate } = useFetch<ProfileResponse>("/users/me");
  const profile = data?.data;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [handle, setHandle] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setSkills((profile.skills ?? []).join(", "));
      setHandle(profile.handle ?? "");
      setPhotoUrl(profile.photoUrl ?? null);
    }
  }, [profile]);

  const initials = useMemo(() => initialsFor(displayName, profile?.email), [displayName, profile?.email]);

  async function save() {
    const nextErrors = validateProfile(displayName, handle, bio);
    setFieldErrors(nextErrors);
    setFormError("");
    setSuccess("");
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          handle: handle.trim(),
        }),
      });
      setSuccess("Profile saved.");
      await mutate();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setFieldErrors((current) => ({ ...current, handle: "This handle is already taken." }));
      } else {
        setFormError(err instanceof ApiError ? err.message : "Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(file: File | null) {
    setSuccess("");
    setFormError("");
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setFieldErrors((current) => ({ ...current, photo: "JPG or PNG only" }));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setFieldErrors((current) => ({ ...current, photo: "Max 5 MB" }));
      return;
    }

    setFieldErrors((current) => ({ ...current, photo: undefined }));
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await apiFetch<PhotoUploadResponse>("/users/me/photo", { method: "POST", body: formData });
      const nextPhotoUrl = photoUrlFromResponse(response);
      setPhotoUrl(nextPhotoUrl);
      setSuccess("Photo uploaded.");
      await mutate();
    } catch (err) {
      setFieldErrors((current) => ({ ...current, photo: err instanceof ApiError ? err.message : "Failed to upload photo." }));
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void uploadPhoto(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void uploadPhoto(event.dataTransfer.files.item(0));
  }

  if (isLoading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My profile</h1>

      <Card className={styles.card}>
        <div className={styles.avatar}>
          {photoUrl ? <Image className={styles.avatarImage} src={photoUrl} alt="" width={64} height={64} unoptimized /> : <div className={styles.avatarCircle}>{initials}</div>}
          <div>
            <div className={styles.avatarName}>{displayName || "Freelancer"}</div>
            <div className={styles.avatarEmail}>{profile?.email}</div>
          </div>
        </div>

        <label className={styles.uploadDropzone} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
          <span className={styles.uploadTitle}>{uploading ? "Uploading..." : "Upload profile photo"}</span>
          <span className={styles.hint}>JPG or PNG, max 5 MB</span>
          <input className={styles.fileInput} type="file" accept="image/jpeg,image/png" onChange={onFileChange} disabled={uploading} />
        </label>
        {fieldErrors.photo ? <div className={styles.fieldError}>{fieldErrors.photo}</div> : null}

        <div className={styles.sectionTitle}>Public profile</div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="displayName">Display name</label>
          <input id="displayName" className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" aria-invalid={fieldErrors.displayName ? "true" : undefined} aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined} />
          {fieldErrors.displayName ? <div id="displayName-error" className={styles.fieldError}>{fieldErrors.displayName}</div> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="handle">Handle</label>
          <input id="handle" className={styles.input} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your-handle" aria-invalid={fieldErrors.handle ? "true" : undefined} aria-describedby={fieldErrors.handle ? "handle-error handle-hint" : "handle-hint"} />
          <div id="handle-hint" className={styles.hint}>Public profile URL: /freelancer/{handle || "your-handle"}</div>
          {fieldErrors.handle ? <div id="handle-error" className={styles.fieldError}>{fieldErrors.handle}</div> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="bio">Bio</label>
          <textarea id="bio" className={styles.textarea} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell buyers about yourself..." aria-invalid={fieldErrors.bio ? "true" : undefined} aria-describedby={fieldErrors.bio ? "bio-error bio-count" : "bio-count"} />
          <div id="bio-count" className={styles.hint}>{bio.length}/{MAX_BIO_LENGTH}</div>
          {fieldErrors.bio ? <div id="bio-error" className={styles.fieldError}>{fieldErrors.bio}</div> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="skills">Skills</label>
          <input id="skills" className={styles.input} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python" />
          <div className={styles.hint}>Comma-separated. Used by AI agent for bid matching.</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </button>
          {formError ? <span className={styles.error}>{formError}</span> : null}
          {success ? <span role="status" className={styles.success}>{success}</span> : null}
        </div>
      </Card>
    </div>
  );
}
