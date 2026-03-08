import Breadcrumb from "components/Breadcrumb";
import { Page } from "components/shared/Page";

import PropTypes from "prop-types";

const TitlePage = ({ title }) => {
  return (
    <Page title={title}>
      <div className="transition-content w-full px-(--margin-x) pt-3 lg:pt-3">
        <Breadcrumb title={title} />
      </div>
    </Page>
  );
};

TitlePage.propTypes = {
  children: PropTypes.node,
  demo: PropTypes.string.isRequired,
};

export default TitlePage;
