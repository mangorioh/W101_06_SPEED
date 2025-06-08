"use client";

import { FormEvent, useState, useEffect } from "react";
import bibtexParse from "bibtex-parse-js";

type Entity = {
  _id: string;
  name: string;
  valid: boolean;
};

const SubmitArticlePage = () => {
  //file upload
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  const handleUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const entries = bibtexParse.toJSON(text);
        if (!entries.length) throw new Error("No entries found");
        const entry = entries[0].entryTags;

        //map bibtex tags to form fields
        setTitle(entry.title?.replace(/[{}]/g, "") || "");
        setAuthorList(
          entry.author
            ? entry.author
                .split(/ and |,/i)
                .map((a: string) => a.trim().replace(/[{}]/g, ""))
            : [""]
        );
        setJournal(entry.journal?.replace(/[{}]/g, "") || "");
        setPubYear(entry.year ? parseInt(entry.year, 10) : 0);
        setVolume(entry.volume || "");
        setNumber(entry.number || "");
        setPages(entry.pages || "");
        setDoi(entry.doi || "");
        setPublisher(entry.publisher?.replace(/[{}]/g, "") || "");
      } catch (err) {
        console.error(err);
        alert("Failed to parse BibTeX file: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // main form fields
  const [title, setTitle] = useState("");
  const [authorList, setAuthorList] = useState<string[]>([""]);
  const [journal, setJournal] = useState("");
  const [pubYear, setPubYear] = useState<number>(0);
  const [volume, setVolume] = useState("");
  const [number, setNumber] = useState("");
  const [pages, setPages] = useState("");
  const [doi, setDoi] = useState("");
  const [publisher, setPublisher] = useState(""); // new publisher state
  const [username, setUsername] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // new state for practices & claims
  const [allPractices, setAllPractices] = useState<Entity[]>([]);
  const [allClaims, setAllClaims] = useState<Entity[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // fetch logged‐in user, plus practices & claims
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      window.location.href = "/user/login";
      return;
    }

    // fetch username
    fetch(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/user/login";
          return;
        }
        const data = await res.json();
        setUsername(data.username);
      })
      .catch(() => {
        window.location.href = "/user/login";
      });

    // fetch practices
    fetch(`${baseUrl}/practices`)
      .then((res) => res.json())
      .then((data: Entity[]) => setAllPractices(data))
      .catch((err) => console.error("couldn't load practices", err));

    // fetch claims
    fetch(`${baseUrl}/claims`)
      .then((res) => res.json())
      .then((data: Entity[]) => setAllClaims(data))
      .catch((err) => console.error("couldn't load claims", err));
  }, []);

  const submitNewArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // basic validation
    if (
      !title.trim() ||
      authorList.some((a) => !a.trim()) ||
      !journal.trim() ||
      !doi.trim()
    ) {
      alert(
        "please fill in required fields: title, author(s), journal, and doi."
      );
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !username) {
      alert("you must be logged in to submit.");
      return;
    }

    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const response = await fetch(`${baseUrl}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          author: authorList,
          journal,
          published_date: pubYear ? new Date(pubYear, 0).toISOString() : undefined,
          volume,
          number: number ? parseInt(number, 10) : undefined,
          // if pages are stored as a string in your schema, include them as-is:
          pages,
          DOI: doi,
          publisher: publisher || undefined, // include publisher if provided
          submitter: username,
          // new fields:
          practice: selectedPractices,
          claim: selectedClaims,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setSubmitError(errorText || "failed to submit article");
        return;
      }

      setSubmitSuccess(true);
      // optionally clear form fields here
    } catch (err: any) {
      setSubmitError(err.message || "failed to submit article");
    }
  };

  const addAuthor = () => setAuthorList([...authorList, ""]);
  const removeAuthor = (index: number) =>
    setAuthorList(authorList.filter((_, i) => i !== index));
  const changeAuthor = (index: number, value: string) =>
    setAuthorList(authorList.map((a, i) => (i === index ? value : a)));

  // toggle selection for practices & claims
  const togglePractice = (id: string) => {
    setSelectedPractices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleClaim = (id: string) => {
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit New Article</h1>

      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300">
          article submitted successfully!
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {submitError}
        </div>
      )}

      {/* bibtex uploader */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <input
            className="button-text"
            id="file"
            type="file"
            accept=".bib"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleUpload}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Upload
          </button>
        </div>
        <span className="text-sm text-gray-600">or enter details manually:</span>
      </div>

      <form onSubmit={submitNewArticle} className="space-y-4">
        {/* title */}
        <div>
          <label htmlFor="title" className="block font-medium">
            Title <span className="text-xs">(required)</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* authors */}
        <div>
          <label className="block font-medium">
            Author(s) <span className="text-xs">(required)</span>
          </label>
          {authorList.map((a, idx) => (
            <div key={idx} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={a}
                onChange={(e) => changeAuthor(idx, e.target.value)}
                className="flex-1 border border-gray-300 rounded p-2"
              />
              <button
                type="button"
                onClick={() => removeAuthor(idx)}
                className="px-2 text-red-600"
              >
                &minus;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAuthor}
            className="font-semibold text-blue-600"
          >
            + Add Author
          </button>
        </div>

        {/* journal */}
        <div>
          <label htmlFor="journal" className="block font-medium">
            Journal <span className="text-xs">(required)</span>
          </label>
          <input
            type="text"
            id="journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* publisher*/}
        <div>
          <label htmlFor="publisher" className="block font-medium">
            Publisher
          </label>
          <input
            type="text"
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* publication year */}
        <div>
          <label htmlFor="pubYear" className="block font-medium">
            Publication Year <span className="text-xs">(required)</span>
          </label>
          <input
            type="number"
            id="pubYear"
            value={pubYear || ""}
            onChange={(e) => setPubYear(parseInt(e.target.value || "0"))}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* volume */}
        <div>
          <label htmlFor="volume" className="block font-medium">
            Volume
          </label>
          <input
            type="text"
            id="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* number */}
        <div>
          <label htmlFor="number" className="block font-medium">
            Number
          </label>
          <input
            type="text"
            id="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* pages */}
        <div>
          <label htmlFor="pages" className="block font-medium">
            Pages
          </label>
          <input
            type="text"
            id="pages"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* doi */}
        <div>
          <label htmlFor="doi" className="block font-medium">
            DOI <span className="text-xs">(required)</span>
          </label>
          <input
            type="text"
            id="doi"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* practices multi‐select */}
        <div>
          <label className="block font-medium mb-1">Practices</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allPractices.map((p) => (
              <label key={p._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPractices.includes(p._id)}
                  onChange={() => togglePractice(p._id)}
                  className="h-4 w-4"
                />
                <span className="text-gray-700">{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* claims multi‐select */}
        <div>
          <label className="block font-medium mb-1">Claims</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allClaims.map((c) => (
              <label key={c._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedClaims.includes(c._id)}
                  onChange={() => toggleClaim(c._id)}
                  className="h-4 w-4"
                />
                <span className="text-gray-700">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* submit button */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SubmitArticlePage;
