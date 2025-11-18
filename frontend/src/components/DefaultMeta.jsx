import { Helmet } from "react-helmet-async";

const DefaultMeta = () => {
  return (
    <Helmet defaultTitle="Campus Founders" titleTemplate="%s | Campus Founders">
      <meta
        name="description"
        content="Where student founders, investors, and innovators connect to build the next generation of startups."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Campus Founders" />
      <meta property="og:title" content="Campus Founders" />
      <meta
        property="og:description"
        content="Where student founders, investors, and innovators connect to build the next generation of startups."
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Campus Founders" />
      <meta
        name="twitter:description"
        content="Where student founders, investors, and innovators connect to build the next generation of startups."
      />
    </Helmet>
  );
};

export default DefaultMeta;
