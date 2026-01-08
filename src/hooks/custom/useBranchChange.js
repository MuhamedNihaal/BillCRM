import { useLocalStorage } from "hooks/useLocalStorage";

const useBranchChange = () => {
  const [branch] = useLocalStorage("branch");

  return branch;
};

export default useBranchChange;
