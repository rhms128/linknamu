import type { MetadataRoute } from "next";

/**
 * 검색 결과에서 빼는 일은 layout.tsx의 `robots: { index: false }`(noindex 메타 태그)가 한다.
 *
 * 여기서 크롤링을 막지(Disallow) 않는 이유가 있다.
 * Disallow를 걸면 크롤러가 페이지를 아예 읽지 않아 noindex 태그도 못 본다.
 * 그러면 다른 곳에 링크가 걸렸을 때 내용 없이 URL만 검색 결과에 남을 수 있다.
 * 확실히 빼려면 크롤링은 허용하고 noindex를 읽게 해야 한다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
