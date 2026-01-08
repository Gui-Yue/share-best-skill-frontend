import { useEffect, useState } from "react";
import { loadSkills } from "./skillDb";
import { getStrings, useLanguage } from "./i18n";

export function useSkills() {
  const { language } = useLanguage();
  const strings = getStrings(language);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadSkills()
      .then((data) => {
        if (active) {
          setSkills(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || strings.loadingFailed);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [strings.loadingFailed]);

  return { skills, loading, error };
}
