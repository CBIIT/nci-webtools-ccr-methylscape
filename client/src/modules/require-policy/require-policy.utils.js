function asPolicyRegex(policy) {
  return new RegExp(`^${policy}$`);
}

function isPolicyAuthorized(policy, action, resource) {
  return asPolicyRegex(policy.action).test(action) && asPolicyRegex(policy.resource).test(resource);
}

export function isAuthorized(session, action, resource) {
  const isAuthorizedPolicy = (policy) => isPolicyAuthorized(policy, action, resource);
  return session?.user?.rolePolicies?.some(isAuthorizedPolicy);
}
