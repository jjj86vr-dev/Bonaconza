import { price } from '../lib/format'

function Shape({ w, h, picked }) {
  return (
    <div
      className={`plan-shape ${picked ? 'is-picked' : ''}`}
      style={{ gridTemplateColumns: `repeat(${Math.min(w, 5)}, 9px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: Math.min(w, 5) * Math.min(h, 5) }).map((_, index) => (
        <i key={index} />
      ))}
    </div>
  )
}

export default function PlanCard({ plan, picked = false, remaining = null, onPick, as = 'button' }) {
  const Tag = as
  const perks = Array.isArray(plan.perks) ? plan.perks : []
  const soldOut = remaining !== null && remaining <= 0

  return (
    <Tag
      type={as === 'button' ? 'button' : undefined}
      className={`plan ${picked ? 'is-picked' : ''}`}
      onClick={soldOut ? undefined : () => onPick?.(plan)}
      disabled={as === 'button' ? soldOut : undefined}
      aria-pressed={as === 'button' ? picked : undefined}
    >
      {plan.max_units !== null && plan.max_units !== undefined && (
        <span className="plan-flag">
          {soldOut ? 'esaurito' : `restano ${remaining ?? plan.max_units}`}
        </span>
      )}

      <span className="plan-name">{plan.name}</span>

      <span className="plan-price">
        {price(plan.price_cents)}
        <small>
          una tantum · {plan.w}×{plan.h} celle
        </small>
      </span>

      <Shape w={plan.w} h={plan.h} picked={picked} />

      <span className="plan-tagline">{plan.tagline}</span>

      <ul className="plan-perks">
        {perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
    </Tag>
  )
}
