export function Banner({ type = 'info', children }) {
  return <div className={`banner banner-${type}`}><span>{children}</span></div>;
}

export function Spinner({ dark }) {
  return <span className={`spinner${dark ? ' dark' : ''}`} />;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      {title && <div className="big">{title}</div>}
      {children}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
    </div>
  );
}
