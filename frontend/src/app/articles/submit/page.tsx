"use client";

import { FormEvent, useState } from "react";
import bibtexParse from "bibtex-parse-js";
import { Article } from "@/types/article";

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
        setAuthors(
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
      } catch (err) {
        console.error(err);
        alert("Failed to parse BibTeX file: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    };

    //fields
    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState<string[]>([""]);
    const [journal, setJournal] = useState("");
    const [pubYear, setPubYear] = useState<number>(0);
    const [volume, setVolume] = useState("");
    const [number, setNumber] = useState("");
    const [pages, setPages] = useState("");
    const [doi, setDoi] = useState("");

    const submitNewArticle = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim() || authors.some(a => !a.trim()) || !journal.trim() || !doi.trim()) {
            alert("Please fill in all required fields: Title, Author(s), Journal, and DOI.");
            return;
        }

        console.log(
        JSON.stringify({
            title,
            authors,
            journal,
            publication_year: pubYear,
            volume,
            number,
            pages,
            doi
        })
        );

        await fetch('http://localhost:3000/articles', { // Your NestJS URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            authors,
            journal,
            publication_year: pubYear,
            volume,
            number,
            pages,
            doi
        }),
      });
  };

  const addAuthor = () => setAuthors([...authors, ""]);
  const removeAuthor = (index: number) => setAuthors(authors.filter((_, i) => i !== index));
  const changeAuthor = (index: number, value: string) => setAuthors(authors.map((author, i) => (i === index ? value : author)));

  return (
    <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Submit New Article</h1>

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
                    className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                    Upload
                </button>
            </div>
            <span className="text-sm text-gray-600">Or enter details manually:</span>
        </div>


        <form onSubmit={submitNewArticle} className="space-y-4">
            <div>
                <label htmlFor="title" className="block font-medium">
                    Title <span className="text-xs">Required</span>
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                />
            </div>

            <div>
                <label className="block font-medium">
                    Author(s) <span className="text-xs">Required</span>
                </label>
                {authors.map((author, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => changeAuthor(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded p-2"
                    />
                    <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-red-600 font-bold"
                    >
                        &minus;
                    </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addAuthor}
                    className="text-blue-600 font-semibold"
                >
                    + Add Author
                </button>
            </div>

            <div>
                <label htmlFor="journal" className="block font-medium">
                    Journal <span className="text-xs">Required</span>
                </label>
                <input
                    type="text"
                    id="journal"
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                />
            </div>

            <div>
                <label htmlFor="pubYear" className="block font-medium">
                    Publication Year <span className="text-xs">Required</span>
                </label>
                <input
                    type="number"
                    id="pubYear"
                    value={pubYear || ""}
                    onChange={(e) => setPubYear(parseInt(e.target.value || "0"))}
                    className="w-full border border-gray-300 rounded p-2"
                />
            </div>

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

            <div>
                <label htmlFor="doi" className="block font-medium">
                    DOI <span className="text-xs">Required</span>
                </label>
                <input
                    type="text"
                    id="doi"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                />
            </div>

            <button
                type="submit"
                className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            >
                Submit
            </button>
        </form>
    </div>
  );
};

export default SubmitArticlePage;
