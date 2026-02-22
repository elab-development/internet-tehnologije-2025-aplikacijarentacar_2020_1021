import pytest
from tests.conftest import get_auth_headers


@pytest.mark.parametrize(

    "role, can_run",
    [
        pytest.param("admin_token", True),
        pytest.param("manager_token", True),
        pytest.param("customer_token", True),
        pytest.param(None, True),
    ]

)
def test_get_vehicles_with_auth(client, user_tokens, vehicle, admin_user, manager_user, customer_user,
               create_roles, role, can_run):
    if role:
        headers = get_auth_headers(user_tokens[role])
        response = client.get("/vehicles", headers=headers)
    else:
        response = client.get("/vehicles")
    assert response.status_code == 200


@pytest.mark.parametrize(
    "role, can_run, expected_status_code",
    [
        pytest.param("admin_token", True, 200, id="Admin"),
        pytest.param("manager_token", False, 403, id="Manager"),
        pytest.param("customer_token", False, 403, id="Customer"),
        pytest.param(None, False, 401, id="Non-authenticated"),
    ]
)
def test_add_vehicle(client, user_tokens, vehicle, admin_user, manager_user, customer_user,
               create_roles, role, can_run, expected_status_code):

    body = {
        "brand": "Audi",
        "model": "a4",
        "price_per_day": 25.0,
        "available": True
        }

    if role:
        headers = get_auth_headers(user_tokens[role])
        response = client.post("/vehicles", json=body, headers=headers)
    else:
        response = client.post("/vehicles", json=body)

    assert response.status_code == expected_status_code
    if expected_status_code == 200:
        assert response.json().get("status") == "ok"
    elif expected_status_code == 401:
        assert response.json().get("detail") == "Not authenticated"
    else:
        assert response.json().get("detail") == "Access denied. Required roles: admin"


@pytest.mark.parametrize(
    "role, can_run, expected_status_code, vehicle_id",
    [
        pytest.param("admin_token", True, 200, 1, id="Admin"),
        pytest.param("manager_token", False, 403, 1, id="Manager"),
        pytest.param("customer_token", False, 403, 1, id="Customer"),
        pytest.param(None, False, 401, 1, id="Non-authenticated"),
        pytest.param("admin_token", True, 404, 121214, id="Non existing vehicle"),
    ]
)
def test_update_status(client, user_tokens, vehicle, admin_user, manager_user, customer_user,
                       create_roles, role, can_run, expected_status_code, vehicle_id):
    if role:
        headers = get_auth_headers(user_tokens[role])
        response = client.put(
            f"/vehicles/{vehicle_id}/status",
            params={"new_status": False},
            headers=headers
        )
        print(response.json())
    else:
        response = client.put(f"/vehicles/{vehicle_id}/status")

    assert response.status_code == expected_status_code
    if expected_status_code == 200:
        assert "Status successfully updated" in response.json().get("message")
    elif expected_status_code == 401:
        assert response.json().get("detail") == "Not authenticated"
    elif expected_status_code == 404:
        assert "not found" in response.json().get("detail")
    else:
        assert response.json().get("detail") == "Access denied. Required roles: admin"


@pytest.mark.parametrize(
    "role, can_run, expected_status_code, vehicle_id",
    [
        pytest.param("admin_token", True, 200, 1, id="Admin"),
        pytest.param("manager_token", False, 403, 1, id="Manager"),
        pytest.param("customer_token", False, 403, 1, id="Customer"),
        pytest.param(None, False, 401, 1, id="Non-authenticated"),
        pytest.param("admin_token", True, 404, 121214, id="Non existing vehicle"),
    ]
)
def test_delete_vehicle(client, user_tokens, vehicle, admin_user, manager_user, customer_user,
                       create_roles, role, can_run, expected_status_code, vehicle_id):
    if role:
        headers = get_auth_headers(user_tokens[role])
        response = client.delete(
            f"/vehicles/{vehicle_id}",
            headers=headers
        )
    else:
        response = client.delete(f"/vehicles/{vehicle_id}")

    assert response.status_code == expected_status_code
    if expected_status_code == 200:
        assert response.json().get("message") == f"Vehicle with id: {vehicle_id} deleted"
    elif expected_status_code == 401:
        assert response.json().get("detail") == "Not authenticated"
    elif expected_status_code == 404:
        assert "not found" in response.json().get("detail")
    else:
        assert response.json().get("detail") == "Access denied. Required roles: admin"