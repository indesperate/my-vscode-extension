import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const provider = new FileLinkProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: "plaintext" },
      provider
    )
  );
}

class FileLinkProvider implements vscode.DocumentLinkProvider {
  public provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.DocumentLink[] {
    const links: vscode.DocumentLink[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      const regex = /([a-zA-Z]:\\[^:]+|[^:]+):(\d+):(\d+)(.*)/g;
      let matches;

      while ((matches = regex.exec(text)) !== null) {
        const [fullMatch, file, lineStr, columnStr, message] = matches;
        const line = parseInt(lineStr, 10) - 1; // VS Code lines are 0-based
        const column = parseInt(columnStr, 10) - 1;

        // Create a range that represents the link in the document
        const matchStartIndex = matches.index;
        const matchEndIndex =
          matchStartIndex + fullMatch.length - message.length;
        const range = new vscode.Range(i, matchStartIndex, i, matchEndIndex);

        // Resolve tohe file path relative to the current document
        const filePath = vscode.Uri.file(vscode.workspace.asRelativePath(file));
        const target = vscode.Uri.parse(`${filePath}#${line},${column}`);

        const link = new vscode.DocumentLink(range, target);
        link.tooltip = `Go to file under cursor - ${message.trim()}`;

        links.push(link);
      }
    }
    return links;
  }
}

export function deactivate() {}
