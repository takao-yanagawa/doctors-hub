import { NextRequest, NextResponse } from "next/server";

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ articles: [] });
    }

    // Search for article IDs
    const searchParams = new URLSearchParams({
      db: "pubmed",
      term: query,
      retmax: "3",
      retmode: "json",
      sort: "relevance",
    });

    const searchRes = await fetch(`${ESEARCH_URL}?${searchParams}`);
    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    // Fetch article details
    const fetchParams = new URLSearchParams({
      db: "pubmed",
      id: ids.join(","),
      retmode: "xml",
      rettype: "abstract",
    });

    const fetchRes = await fetch(`${EFETCH_URL}?${fetchParams}`);
    const xml = await fetchRes.text();

    const articles: PubMedArticle[] = [];
    const articleMatches = xml.split("<PubmedArticle>");

    for (let i = 1; i < articleMatches.length; i++) {
      const block = articleMatches[i];

      const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const titleMatch = block.match(/<ArticleTitle>(.+?)<\/ArticleTitle>/s);
      const journalMatch = block.match(/<Title>(.+?)<\/Title>/);
      const yearMatch = block.match(/<PubDate>\s*<Year>(\d+)<\/Year>/);
      const authorMatch = block.match(/<LastName>(.+?)<\/LastName>/);

      articles.push({
        pmid: pmidMatch?.[1] || "",
        title: (titleMatch?.[1] || "").replace(/<[^>]+>/g, ""),
        authors: authorMatch ? `${authorMatch[1]} et al.` : "Unknown",
        journal: journalMatch?.[1] || "",
        year: yearMatch?.[1] || "",
      });
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("PubMed API error:", error);
    return NextResponse.json({ articles: [] });
  }
}
