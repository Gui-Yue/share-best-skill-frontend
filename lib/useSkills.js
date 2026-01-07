import { useEffect, useState } from "react";
import { loadSkills } from "./skillDb";

export function useSkills() {
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
          setError(err?.message || "加载失败");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { skills, loading, error };
}
