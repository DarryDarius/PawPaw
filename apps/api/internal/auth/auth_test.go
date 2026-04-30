package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBearerToken(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer abc123")

	if got := bearerToken(req); got != "abc123" {
		t.Fatalf("bearerToken = %q", got)
	}
}

func TestParseID(t *testing.T) {
	if id, ok := ParseID("42"); !ok || id != 42 {
		t.Fatalf("ParseID returned %d, %v", id, ok)
	}
	if _, ok := ParseID("nope"); ok {
		t.Fatal("ParseID accepted invalid id")
	}
}
