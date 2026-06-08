{
  description = "isdino.com - Personal portfolio site";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            wrangler
          ];

          shellHook = ''
            echo "🌐 isdino.com dev environment ready"
            echo "  Node: $(node --version)"
            echo "  Wrangler: $(wrangler --version 2>&1 | head -1)"
          '';
        };
      }
    );
}
