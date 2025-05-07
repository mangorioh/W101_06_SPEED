import SortableTable from "@/components/Table/SortableTable";
import data from "../utils/dummydata";

interface ArticlesInterface {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
}

type ArticlesProps = {
  articles: ArticlesInterface[];
};

const ArticlesPage = ({ articles }: ArticlesProps) => {
  const headers: { key: keyof ArticlesInterface; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "source", label: "Source" },
    { key: "pubyear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" },
    { key: "evidence", label: "Evidence" },
  ];

  return (
    <div className="container">
      <SortableTable headers={headers} data={articles} />
    </div>
  );
};

async function getData(): Promise<ArticlesInterface[]> {
  return new Promise((resolve) => {
    const articles = data.map((article) => ({
      id: article.id ?? article._id,
      title: article.title,
      authors: article.authors,
      source: article.source,
      pubyear: article.pubyear,
      doi: article.doi,
      claim: article.claim,
      evidence: article.evidence,
    }));
    resolve(articles);
  });
}

export default async function Articles() {
  const articles = await getData();
  return <ArticlesPage articles={articles} />;
}
